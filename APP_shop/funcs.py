import logging
import secrets

from django.db import transaction
from django.shortcuts import render, redirect

from django.utils import timezone
from Core.services.services import int_decrease_by_percentage
# from . import qiwi
from .models import *
from .services import qiwi


# from .qiwi import reject_bill


def try_apply_promo(request, user_, product_, price, promo):
    promo_ = Promo.objects.filter(promo=promo).first()
    if promo and not promo_:
        return {'render': render(request, 'APP_shop/catalog.html', context={
            'invalid': 'The promo-code does not exists.',
            'products': Product.objects.order_by('name').reverse(), })}

    if promo_:
        validation = promo_validate(promo_, user_.username, product_.name)
        if isinstance(validation, dict) and 'invalid' in validation:
            return {'render': render(request, 'APP_shop/catalog.html', context={
                'invalid': validation['invalid'],
                'products': Product.objects.order_by('name').reverse(), })}
        if promo_.promo_type == Promo.PromoType.sale:
            return {'price': int_decrease_by_percentage(price, promo_.promo_value),
                    'promo_': promo_}
        elif promo_.promo_type == Promo.PromoType.free:
            if product_.type == product_.ProductType.account:
                pass  # in dev
            elif product_.type == product_.ProductType.program:
                add_license_time(user_=user_, product_name=product_.name, days=promo_.promo_value)
                promo_.used_by.add(user_.id)
                return {'redirect': redirect('profile')}
    return None


@transaction.atomic
def execute_order(order: Order):
    user_ = order.user
    if order.type == Order.OrderType.PRODUCT:
        product_ = order.product
        if product_.type == Product.ProductType.program:
            user_.balance -= order.amountRub
            user_.save()
            order.status = Order.OrderStatus.DONE
            add_license_time(user_=order.user, product_name=product_.name,
                             days=get_count_license_days(order.license_type))
        elif product_.type == Product.ProductType.account:
            pass  # in dev
    elif order.type == Order.OrderType.BALANCE:
        user_.balance += order.amountRub
        user_.save()

    order.is_complete = True
    order.save()
    promo_ = order.promo
    if promo_:
        promo_.used_by.add(order.user.id)
        promo_.save()


@transaction.atomic
def check_user_payments(user: User):
    orders = Order.objects.filter(user=user)
    for order in orders:
        if order.status.upper() == Order.OrderStatus.WAITING.upper():
            order_status = qiwi.check_order(order.order_id)['status']['value']
            if order_status.upper() == Order.OrderStatus.PAID.upper():
                order.status = Order.OrderStatus.PAID
                order.save()
                execute_order(order)
            elif order_status.upper() == Order.OrderStatus.EXPIRED.upper():
                order.status = Order.OrderStatus.EXPIRED
                order.save()


def get_product_price_by_license_type(product: Product, license_type: str):
    if license_type == LicenseType.week:
        return int_decrease_by_percentage(product.price_week, product.sale)
    elif license_type == LicenseType.month:
        return int_decrease_by_percentage(product.price_month, product.sale)
    elif license_type == LicenseType.half_year:
        return int_decrease_by_percentage(product.price_half_year, product.sale)
    elif license_type == LicenseType.year:
        return int_decrease_by_percentage(product.price_year, product.sale)
    elif license_type == LicenseType.forever:
        return int_decrease_by_percentage(product.price_forever, product.sale)
    else:
        return None


def add_license_time(user_: User, product_name: str, days: int):
    license_, created = License.objects.get_or_create(user=user_,
                                                      product=Product.objects.get(name=product_name))
    if license_.date_expiration > timezone.now():
        license_.date_expiration = license_.date_expiration + timedelta(days=int(days))
    else:
        license_.date_expiration = timezone.now() + timedelta(days=int(days))
    license_.save()


def promo_validate(promo: Promo, username: str, product_name: str):
    if promo.applys_now >= promo.applys_max:
        return {'invalid': f'Promo has been used more than '
                           f'{promo.applys_max} times.'}
    elif promo.date_expiration < datetime.utcnow():
        return {'invalid': 'Promo has expired.'}
    elif promo.used_by.filter(username=username).exists():
        return {'invalid': 'Promo already used.'}
    elif not promo.products.filter(id=Product.objects.get(name=product_name).id).exists():
        return {'invalid': 'Promo is not available for this product.'}
    return True
