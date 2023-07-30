import base64
import hashlib
import hmac
import time
from datetime import timedelta
import logging
from django.conf import settings
from django.core.exceptions import BadRequest
from django.utils import timezone
import environ
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponseBadRequest, HttpResponse, HttpResponseServerError, Http404, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.decorators import decorator_from_middleware
from rest_framework.response import Response

from Core.middleware import reCaptchaMiddleware
from Core.models import User
from .funcs import get_product_price_by_license_type, try_apply_promo, add_license_time, check_user_payments, \
    execute_order
from .middleware import QiwiIPMiddleware
from .models import Product, Order, License
from .services.qiwi import create_order, create_payment_and_order, get_webhook_key, register_webhook

env = environ.Env()

logger = logging.getLogger(__name__)


def catalog(request):
    return render(request, 'APP_shop/catalog.html', context={
        'products': Product.objects.order_by('name').reverse(), })


@decorator_from_middleware(reCaptchaMiddleware)
@login_required(redirect_field_name=None, login_url='signin')
@transaction.atomic
def buy_product_program(request):
    if request.method != "POST":
        return HttpResponseBadRequest()

    user_: User = request.user
    license_type = request.POST.get('license_type')
    product_name = request.POST.get('product_name')

    if not all((license_type, product_name)):
        return HttpResponseBadRequest()

    product_ = Product.objects.get(name=product_name)

    if not request.recaptcha_is_valid:
        is_test_period_activated = False
        if License.objects.filter(user=user_, product=product_).exists():
            is_test_period_activated = License.objects.get(
                user=user_, product=product_).is_test_period_activated
        return render(request, 'APP_shop/product_program.html', {
            'invalid': 'Invalid reCAPTCHA. Please try again.',
            'product': product_,
            'is_test_period_activated': is_test_period_activated,
            'count_starts': License.objects.filter(product=product_)
                      .aggregate(Sum('count_starts'))['count_starts__sum']
        })


    price = get_product_price_by_license_type(product_, license_type)
    if not price:
        raise BadRequest

    if price > user_.balance:
        return render(request, 'APP_shop/orders.html', {
            'invalid': f'Недостаточно средств на балансе. '
                       f'Пополните баланс на {price - user_.balance} ₽',
            'orders': Order.objects.filter(user=request.user).order_by('date_created'),
        })

    promo_result = try_apply_promo(request, user_, product_,
                                   price, request.POST.get('promo', '').upper())
    if promo_result is None:
        promo_ = None
    elif 'price' in promo_result:
        price = promo_result['price']
        promo_ = promo_result['promo_']
    elif 'render' in promo_result:
        return promo_result['render']
    elif 'redirect' in promo_result:
        return promo_result['redirect']
    else:
        promo_ = None

    order_ = Order.objects.create(user=user_,
                                  amountRub=price,
                                  promo=promo_,
                                  product=product_,
                                  license_type=license_type,
                                  type=Order.OrderType.PRODUCT)
    execute_order(order_)
    return redirect('profile')


@login_required(redirect_field_name=None, login_url='signin')
@transaction.atomic
def activate_test_period(request):
    if request.method != "POST":
        return HttpResponseBadRequest()
    user_ = User.objects.get(username=request.user.username)
    product_ = Product.objects.get(name=request.POST['product'])
    license_ = License.objects.get_or_create(user=user_, product=product_)[0]
    if license_.is_test_period_activated:
        return HttpResponseBadRequest()
    license_.is_test_period_activated = True
    license_.save()
    add_license_time(user_=user_, product_name=product_.name, days=product_.test_period_days)
    return redirect('profile')


@login_required(redirect_field_name=None, login_url='signin')
def orders(request):
    return render(request, 'APP_shop/orders.html', {
        'orders': Order.objects.filter(user=request.user).order_by('date_created'),
    })


@login_required
@decorator_from_middleware(reCaptchaMiddleware)
def balance_increase(request):
    if request.POST:
        if not request.recaptcha_is_valid and not request.user.is_staff:
            return render(request, 'APP_shop/orders.html', {
                'invalid': 'Invalid reCAPTCHA. Please try again.',
                'orders': Order.objects.filter(user=request.user).order_by('date_created'),
            })

        user_ = request.user
        amount = request.POST.get('amount')

        if not amount:
            return render(request, 'APP_shop/orders.html', {
                'invalid': 'Fill the amount field.',
                'orders': Order.objects.filter(user=request.user).order_by('date_created'),
            })

        order_ = create_payment_and_order(user_id=user_.id,
                                          amount=amount,
                                          order_type=Order.OrderType.BALANCE,
                                          expired_minutes=10,
                                          comment=f'User balance: {user_.username}\n')

        return redirect(order_.pay_link)


@login_required
def check_payment(request):
    check_user_payments(request.user)
    return redirect('shop:orders')


@decorator_from_middleware(QiwiIPMiddleware)
def qiwi_hook(request):
    if request.POST:
        logging.warning(request.POST)
        payment = request.POST.get('payment')
        sign_hash = request.POST.get('hash')
        hook_id = request.POST.get('hookId')
        if not all((payment, sign_hash, hook_id)):
            logging.error('Payment dict or hash or hook_id does not exists')
            return HttpResponseBadRequest()

        payment_sum = payment.get('sum')
        currency = payment_sum.get('currency')
        amount = payment_sum.get('amount')
        payment_type = payment.get('type')
        account = payment.get('account')
        txnId = payment.get('txnId')

        data = f'{currency}|{amount}|{payment_type}|{account}|{txnId}'

        webhook_key_base64 = get_webhook_key(hook_id)
        if not webhook_key_base64:
            logging.error('Web hook key is None')
            return HttpResponseBadRequest()

        webhook_key = base64.b64decode(bytes(webhook_key_base64, 'utf-8'))
        if hmac.new(webhook_key, data.encode('utf-8'), hashlib.sha256).hexdigest() == sign_hash:
            return HttpResponse('success')
        else:
            logging.error('Hashes is not equal')
            return HttpResponseBadRequest()
    logging.error('qiwi_hook only POST allowed')
    return HttpResponseBadRequest()


def product_program(request, program_name: str):
    product_ = Product.objects.get(name=program_name)
    if not product_.available:
        return redirect('shop:catalog')
    is_test_period_activated = False
    if request.user.is_authenticated:
        user_ = User.objects.get(username=request.user.username)
        if License.objects.filter(user=user_, product=product_).exists():
            is_test_period_activated = License.objects.get(user=user_, product=product_).is_test_period_activated

    return render(request, 'APP_shop/product_program.html', {
        'product': product_,
        'is_test_period_activated': is_test_period_activated,
        'count_starts': License.objects.filter(product=product_).aggregate(Sum('count_starts'))['count_starts__sum']
    })


def download_program(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if product.type != Product.ProductType.program:
        return HttpResponse(status=404)
    if not product.file:
        return HttpResponse(status=404)

    file_path = product.file.file.path
    file_name = product.file.file.name
    file_content = open(file_path, 'rb').read()
    response = HttpResponse(file_content, content_type='application/force-download')
    response['Content-Disposition'] = f'attachment; filename={file_name}'
    return response
