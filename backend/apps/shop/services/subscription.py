# shop/services/subscription.py
from datetime import timedelta
from typing import TypedDict

from asgiref.sync import sync_to_async
from django.conf import settings
from django.shortcuts import aget_object_or_404
from django.utils.timezone import now

from apps.shop.exceptions.base import (
    InsufficientFundsError, TestPeriodAlreadyUsed,
    TestPeriodActivationFailed
)


class SoftwareSubscriptionService:
    pass


class SoftwareSmallInfo(TypedDict):
    name: str
    img: str


class UserSoftwareSubscriptionInfo(TypedDict):
    software: SoftwareSmallInfo
    expires_at: int
    remaining_hours: int
    starts: int
    last_activity: int


class UserInfo(TypedDict):
    username: str
    email: str
    subscriptions: list[UserSoftwareSubscriptionInfo]


async def calculate_remaining_hours(expiration_date) -> int:
    """Вычисляет оставшиеся часы до истечения подписки."""
    delta = expiration_date - now()
    return max(int(delta.total_seconds() / 3600), 0)


async def get_user_subscriptions(user) -> list[UserSoftwareSubscriptionInfo]:
    """
    The get_user_subscriptions asynchronous function
    retrieves a list of software subscriptions
    associated with a given user. Each subscription is detailed
    with software information, expiration date, last activity,
    remaining hours, and the number of starts.
    :param user: The user for whom to retrieve software subscriptions.
    :return: A list of UserSoftwareSubscriptionInfo instances, each
    representing detailed information about a user's software subscription.
    """
    from apps.shop.models import (
        UserSoftwareSubscription
    )
    subscriptions: list[UserSoftwareSubscription] = await UserSoftwareSubscription.objects.afilter(user=user)
    subscription_infos = []
    for sub in subscriptions:
        subscription_info = UserSoftwareSubscriptionInfo(
            software=SoftwareSmallInfo(
                name=await sync_to_async(lambda: sub.software.name)(),
                img=await sync_to_async(lambda: sub.software.img.url if sub.software.img else '')()
            ),
            expires_at=int(sub.expires_at.timestamp()),
            last_activity=int(sub.last_activity.timestamp()),
            remaining_hours=await calculate_remaining_hours(sub.expires_at),
            starts=sub.starts
        )
        subscription_infos.append(subscription_info)
    return subscription_infos


async def subscribe_user_software(user: settings.AUTH_USER_MODEL, subscription_id: int):
    """
    Creates a UserSubscription (the product is already indicated in it) if
    it does not exist, otherwise changes it by increasing the expiration
    date and debits money from the balance.
    :param user: User object.
    :param subscription_id: software subscription id.
    :return:
    """
    from apps.shop.models import (
        UserSoftwareSubscription, SoftwareSubscription,
        SoftwareSubscriptionOrder,
        BaseOrder
    )
    sub: SoftwareSubscription = await SoftwareSubscription.objects.agetorn(
        SoftwareSubscription.DoesNotExist, id=subscription_id
    )
    if user.balance < sub.amount:
        raise InsufficientFundsError()

    sub_order: SoftwareSubscriptionOrder = await SoftwareSubscriptionOrder.objects.acreate(
        user=user,
        software=await sub.arelated('software'),
        amount=sub.amount,
        type=BaseOrder.OrderTypes.SOFTWARE,
    )
    user.balance -= sub.amount
    await user.asave()

    user_sub, created = await UserSoftwareSubscription.objects.aget_or_create(
        user=user,
        software=sub.software,
    )
    user_sub: UserSoftwareSubscription
    time_category = await sub.arelated('time_category'),
    time_category = time_category[0]
    if created:
        user_sub.expires_at = now() + timedelta(hours=time_category.hours)
    else:
        user_sub.expires_at = user_sub.expires_at + timedelta(hours=time_category.hours)
    await user_sub.asave()
    sub_order.is_completed = True
    await sub_order.asave()


async def activate_test_software_user(user: settings.AUTH_USER_MODEL, software_id: int):
    from apps.shop.models import (
        UserSoftwareSubscription, SoftwareProduct
    )
    try:
        software = await aget_object_or_404(SoftwareProduct, id=software_id)
        user_sub: UserSoftwareSubscription
        user_sub, created = await UserSoftwareSubscription.objects.aget_or_create(
            user=user,
            software=software,
        )
        if user_sub.is_test_period_activated:
            raise TestPeriodAlreadyUsed()
        now_ = now()
        user_sub.is_test_period_activated = True
        user_sub.expires_at = (now_ if created else
                               user_sub.expires_at
                               if user_sub.expires_at > now_ else now_
                               ) + timedelta(days=software.test_period_days)
        await user_sub.asave()
    except TestPeriodAlreadyUsed as e:
        raise e
    except Exception:
        raise TestPeriodActivationFailed()
