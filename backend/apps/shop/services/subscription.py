from datetime import timedelta
from typing import TypedDict

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _

from apps.shop.models import UserSoftwareSubscription, SoftwareSubscription, SoftwareProduct


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
    delta = expiration_date - timezone.now()
    return max(int(delta.total_seconds() / 3600), 0)


async def get_user_subscriptions(user) -> list[UserSoftwareSubscriptionInfo]:
    subscriptions: list[UserSoftwareSubscription] = await sync_to_async(list)(
        UserSoftwareSubscription.objects.filter(user=user))
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


class InsufficientFundsError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = _("Insufficient funds to complete the subscription.")
    default_code = 'insufficient_funds'


@transaction.atomic()
def subscribe_user_software(user: settings.AUTH_USER_MODEL, subscription_id: int):
    sub: SoftwareSubscription = get_object_or_404(SoftwareSubscription, id=subscription_id)

    if user.balance < sub.priceRub:
        raise InsufficientFundsError()

    user.balance -= sub.priceRub
    user.save()

    user_sub, created = UserSoftwareSubscription.objects.get_or_create(
        user=user,
        software=sub.software,
    )
    user_sub: UserSoftwareSubscription
    if created:
        user_sub.expires_at = timezone.now() + timedelta(hours=sub.time_category.hours)
    else:
        user_sub.expires_at = user_sub.expires_at + timedelta(hours=sub.time_category.hours)
    user_sub.save()


class TestPeriodAlreadyUsedException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Test period has already been used.'
    default_code = 'test_period_already_used'


@transaction.atomic()
def activate_test_software_user(user: settings.AUTH_USER_MODEL, software_id: int):
    software = get_object_or_404(SoftwareProduct, id=software_id)

    user_sub: UserSoftwareSubscription
    user_sub, created = UserSoftwareSubscription.objects.get_or_create(
        user=user,
        software=software,
    )
    if user_sub.is_test_period_activated:
        raise TestPeriodAlreadyUsedException()
    now = timezone.now()
    user_sub.is_test_period_activated = True
    user_sub.expires_at = (now if created else
                           user_sub.expires_at
                           if user_sub.expires_at > now else now
                           ) + timedelta(days=software.test_period_days)
    user_sub.save()
