import logging
import environ
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404

from Core.models import User
from Core.services.services import allowed_only
from .forms import DepositForm, BuyProductProgramForm
from .funcs import check_user_payments, execute_order
from .models import Product, Order
from .services.Product.product import ProductService
from .services.orders_service import get_user_orders
from .services.products_service import get_product_program_count_starts, is_test_period_activated
from .services.qiwi import create_payment_and_order

env = environ.Env()

logger = logging.getLogger(__name__)


def catalog(request):
    return render(request, 'APP_shop/catalog.html', context={
        'products': Product.objects.order_by('name').reverse(), })


@allowed_only(('POST',))
@login_required
@transaction.atomic
def buy_product_program(request):
    user_: User = request.user
    license_type = request.POST.get('license_type')
    product_name = request.POST.get('product_name')
    recaptcha_response = request.POST.get('g-recaptcha-response')

    product_ = get_object_or_404(Product, name=product_name)


    form = BuyProductProgramForm(data={
        'user_': user_,
        'license_type': license_type,
        'product_': product_,
        'g-recaptcha-response': recaptcha_response
    })
    if form.is_valid():
        order_ = Order.objects.create(
            user=user_,
            amountRub=form.cleaned_data.get('price'),
            product=product_,
            license_type=license_type,
            type=Order.OrderType.PRODUCT)
        execute_order(order_)
        return redirect('profile')

    return render(request, 'APP_shop/product_program.html', {
        'form': form,
        'product': product_,
        'is_test_period_activated': is_test_period_activated(
            product_id=product_.id, user_id=user_.id),
        'count_starts': get_product_program_count_starts(
            product_id=product_.id)
    })


@login_required(redirect_field_name=None, login_url='signin')
@transaction.atomic
def activate_test_period(request):
    if request.method != "POST":
        return HttpResponseBadRequest()

    from .services.products_service import activate_test_period
    activate_test_period(request.user.id, request.POST.get('product'))
    return redirect('profile')


@login_required(redirect_field_name=None, login_url='signin')
def orders(request):
    user_ = request.user
    form = DepositForm(request.POST or None)
    if form.is_valid():
        order_ = create_payment_and_order(
            user_id=user_.id,
            amount=form.cleaned_data.get('amount'),
            order_type=Order.OrderType.BALANCE,
            expired_minutes=10,
            comment=f'User deposit: {user_.username}\n')

        return redirect(order_.pay_link)

    return render(request, 'APP_shop/orders.html', {
        'form': form,
        'orders': get_user_orders(user_id=user_.id),
    })


@login_required
def check_payment(request):
    check_user_payments(request.user)
    return redirect('shop:orders')


def product_program(request, program_name: str):
    product_ = Product.objects.get(name=program_name)
    if not product_.available:
        return redirect('shop:catalog')

    return render(request, 'APP_shop/product_program.html', {
        'product': product_,
        'is_test_period_activated': is_test_period_activated(
            user_id=request.user.id, product_id=product_.id),
        'count_starts': get_product_program_count_starts(
            product_id=product_.id)
    })


def download_program(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if product.type != Product.ProductType.program or not product.file:
        return HttpResponse(status=404)

    file_content = open(product.file.file.path, 'rb').read()
    response = HttpResponse(file_content, content_type='application/force-download')
    response['Content-Disposition'] = f'attachment; filename={product.file.file.name}'
    return response
