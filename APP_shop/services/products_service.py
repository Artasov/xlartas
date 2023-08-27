from django.core.exceptions import BadRequest
from django.db.models import Sum

from APP_shop.funcs import add_license_time
from APP_shop.models import Subscription, Product


# def execute_buy_product_program()


def get_product_program_count_starts(**kwargs) -> int:
    """
    :param kwargs: Subscription.objects.filter(**kwargs <- this)
    :return: Count starts of product program
    """
    return Subscription.objects.filter(**kwargs) \
        .aggregate(Sum('count_starts'))['count_starts__sum']


def is_test_period_activated(**kwargs) -> bool:
    """
    :param kwargs: Subscription.objects.get(**kwargs <- this)
    :return: Bool: is test period activated
    """
    try:
        return Subscription.objects.get(**kwargs).is_test_period_activated
    except Subscription.DoesNotExist:
        return False


def activate_test_period(user_id: int, product_name: str):
    license_, _ = Subscription.objects.get_or_create(
        user_id=user_id,
        product_id=Product.objects.get(name=product_name).id)
    if license_.is_test_period_activated:
        raise BadRequest
    try:
        product_ = Product.objects.get(name=product_name)
    except Product.DoesNotExist:
        raise BadRequest
    add_license_time(user_id, product_.id, product_.test_period_days)
    license_.is_test_period_activated = True
    license_.save()
