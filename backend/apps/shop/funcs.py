# shop/funcs.py
from adjango.utils.base import decrease_by_percentage

from .models import *


def try_apply_promo(promo: Promo, _user, price):
    if promo.type == Promo.PromoType.DISCOUNT:
        return {'new_price': decrease_by_percentage(price, promo.value),
                'promo_': promo}
    elif promo.type == Promo.PromoType.BALANCE:
        pass
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
