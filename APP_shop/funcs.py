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


def try_apply_promo(promo: Promo, user_, price):
    if promo.type == Promo.PromoType.discount:
        return {'new_price': int_decrease_by_percentage(price, promo.value),
                'promo_': promo}
    elif promo.type == Promo.PromoType.balance:
        execute_order(Order.objects.create(
            user=user_,
            amountRub=promo.value,
            promo=promo,
            status=Order.OrderStatus.DONE,
            type=Order.OrderType.BALANCE
        ))
        return 'redirect_orders'
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
            add_license_time(user_id=order.user.id, product_id=product_.id,
                             days=get_count_license_days(order.license_type))
        elif product_.type == Product.ProductType.account:
            pass  # in dev
    elif order.type == Order.OrderType.BALANCE:
        user_.balance += order.amountRub
        user_.save()

    promo_ = order.promo
    if promo_:
        validation = promo_validate(promo_, user_.username)
        if not (isinstance(validation, dict) and 'invalid' in validation):
            promo_.used_by.add(order.user.id)
            promo_.applys_now += 1
            promo_.save()
    order.status = Order.OrderStatus.DONE
    order.is_complete = True
    order.save()


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
        return int_decrease_by_percentage(product.price_week, product.discount)
    elif license_type == LicenseType.month:
        return int_decrease_by_percentage(product.price_month, product.discount)
    elif license_type == LicenseType.half_year:
        return int_decrease_by_percentage(product.price_half_year, product.discount)
    elif license_type == LicenseType.year:
        return int_decrease_by_percentage(product.price_year, product.discount)
    elif license_type == LicenseType.forever:
        return int_decrease_by_percentage(product.price_forever, product.sale)
    else:
        return None


def add_license_time(user_id: int, product_id: int, days: int):
    license_, _ = Subscription.objects.get_or_create(
        user_id=user_id, product_id=product_id)
    if license_.date_expiration > timezone.now():
        license_.date_expiration = license_.date_expiration + timedelta(days=int(days))
    else:
        license_.date_expiration = timezone.now() + timedelta(days=int(days))
    license_.save()


def promo_validate(promo: Promo, username: str):
    user_promos = Promo.objects.filter(used_by__username=username)
    if promo.group and user_promos.filter(group=promo.group).exists():
        return {'invalid': 'You have already used a promo code from this group.'}
    if promo.applys_now >= promo.applys_max:
        return {'invalid': f'Promo has been used more than '
                           f'{promo.applys_max} times.'}
    if promo.date_expiration < timezone.now():
        return {'invalid': 'Promo has expired.'}
    if promo.used_by.filter(username=username).exists():
        return {'invalid': 'Promo already used.'}
    return True
