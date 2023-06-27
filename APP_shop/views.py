from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
import environ
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.decorators import decorator_from_middleware

from Core.middleware import reCaptchaMiddleware
from Core.models import User
from . import qiwi
from .funcs import get_product_price_by_license_type, generate_bill_id, try_apply_promo, add_license_time
from .funcs import sync_user_bills
from .models import Product, Bill, License

env = environ.Env()


def catalog(request):
    return render(request, 'APP_shop/catalog.html', context={
        'products': Product.objects.order_by('name').reverse(), })


@decorator_from_middleware(reCaptchaMiddleware)
@login_required(redirect_field_name=None, login_url='signin')
@transaction.atomic
def buy(request):
    if request.method != "POST":
        return HttpResponseBadRequest()

    if not request.recaptcha_is_valid:
        return render(request, 'APP_shop/catalog.html', context={
            'invalid': 'Invalid reCAPTCHA. Please try again.',
            'products': Product.objects.order_by('name').reverse(), })

    user_ = User.objects.get(username=request.user.username)
    product_ = Product.objects.get(name=request.POST['product'])
    license_type = request.POST['license_type']

    price = get_product_price_by_license_type(product_, license_type)
    if not price:
        return render(request, 'Core/NotFound.html')

    promo_result = try_apply_promo(request, user_, product_, price, str(request.POST['promo']).upper())
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

    qiwi_bill_id = generate_bill_id()
    expired_minutes = 10
    response = qiwi.create_bill(value=price,
                                billid=qiwi_bill_id,
                                expired_minutes=expired_minutes,
                                comment=f'Product: {product_}  |  License time: {license_type} | {user_.username}',
                                # customer={'username': user_.username},
                                custom_fields={
                                    'product': product_.name,
                                    'license_type': license_type,
                                    'themeCode': 'Nykyta-TCBm1blw_2J', })
    if 'errorCode' in response:
        return render(request, 'APP_shop/catalog.html', context={
            'invalid': "Invalid is on our side, sorry. Please contact us. (creating bill)",
            'products': Product.objects.order_by('name').reverse(), })
    Bill.objects.create(user=user_, product=product_,
                        license_type=license_type, qiwi_bill_id=qiwi_bill_id,
                        pay_link=response['payUrl'], promo=promo_,
                        date_expiration=timezone.now() + timedelta(minutes=expired_minutes))
    return redirect('shop:bills')


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
def bills(request):
    user_ = User.objects.get(username=request.user.username)
    sync_user_bills(user=user_)
    return render(request, 'APP_shop/bills.html', {
        'bills': Bill.objects.filter(user=user_).order_by('date_created'), })


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
        'theme': 3 if product_.name == 'xLMACROS' else "default",
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
