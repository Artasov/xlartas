from django.db import transaction

from apps.Core.services.services import decrease_by_percentage
# from . import qiwi
from .models import *


# from .services import qiwi


# from .qiwi import reject_bill


def try_apply_promo(promo: Promo, user_, price):
    if promo.type == Promo.PromoType.DISCOUNT:
        return {'new_price': decrease_by_percentage(price, promo.value),
                'promo_': promo}
    elif promo.type == Promo.PromoType.BALANCE:
        pass
    return None


@transaction.atomic
def execute_software_order(order: SoftwareSubscriptionOrder):
    user_ = order.user
    software_ = order.software
    user_.balance -= order.amountRub
    user_.save()
    add_license_time(user_id=order.user.id, product_id=product_.id,
                     days=get_count_license_days(order.subscription_variant))

    promo_ = order.promo
    if promo_:
        validation = promo_validate(promo_, user_.username)
        if not (isinstance(validation, dict) and 'invalid' in validation):
            promo_.used_by.add(order.user.id)
            promo_.applys_now += 1
            promo_.save()
    order.is_complete = True
    order.save()


# @transaction.atomic
# def check_user_payments(user: User):
#     orders = SoftwareSubscriptionOrder.objects.filter(user=user)
#     for order in orders:
#         if order.status.upper() == SoftwareSubscriptionOrder.SoftwareOrderStatus.WAITING.upper():
#             order_status = qiwi.check_order(order.order_id)['status']['value']
#             if order_status.upper() == SoftwareSubscriptionOrder.SoftwareOrderStatus.PAID.upper():
#                 order.status = SoftwareSubscriptionOrder.SoftwareOrderStatus.PAID
#                 order.save()
#                 execute_software_order(order)
#             elif order_status.upper() == SoftwareSubscriptionOrder.SoftwareOrderStatus.EXPIRED.upper():
#                 order.status = SoftwareSubscriptionOrder.SoftwareOrderStatus.EXPIRED
#                 order.save()


def get_product_price_by_license_type(product: SoftwareProduct, license_type: str):
    if license_type == SoftwareSubscriptionVariant.WEEK:
        return decrease_by_percentage(product.price_week, product.discount)
    elif license_type == SoftwareSubscriptionVariant.MONTH:
        return decrease_by_percentage(product.price_month, product.discount)
    elif license_type == SoftwareSubscriptionVariant.HALF_YEAR:
        return decrease_by_percentage(product.price_half_year, product.discount)
    elif license_type == SoftwareSubscriptionVariant.YEAR:
        return decrease_by_percentage(product.price_year, product.discount)
    elif license_type == SoftwareSubscriptionVariant.FOREVER:
        return decrease_by_percentage(product.price_forever, product.sale)
    else:
        return None


def add_license_time(user_id: int, product_id: int, days: int):
    license_, _ = UserSoftwareSubscription.objects.get_or_create(
        user_id=user_id, product_id=product_id)
    if license_.expires_at > timezone.now():
        license_.expires_at = license_.expires_at + timedelta(days=int(days))
    else:
        license_.expires_at = timezone.now() + timedelta(days=int(days))
    license_.save()


def promo_validate(promo: Promo, username: str):
    user_promos = Promo.objects.filter(used_by__username=username)
    if promo.group and user_promos.filter(group=promo.group).exists():
        return {'invalid': 'You have already used a promo code from this group.'}
    if promo.applys_now >= promo.applys_max:
        return {'invalid': f'Promo has been used more than '
                           f'{promo.applys_max} times.'}
    if promo.expires_at < timezone.now():
        return {'invalid': 'Promo has expired.'}
    if promo.used_by.filter(username=username).exists():
        return {'invalid': 'Promo already used.'}
    return True
