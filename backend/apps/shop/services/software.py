# shop/services/software.py
from asgiref.sync import sync_to_async
from django.db.models import Sum, Prefetch

from apps.shop.models import (
    UserSoftwareSubscription, SoftwareProductInfo,
    SoftwareSubscriptionInfo, SoftwareSubscription
)


async def get_softwares(queryset, **kwargs) -> list[SoftwareProductInfo]:
    softwares = await queryset.filter(**kwargs).select_related('file').prefetch_related(
        Prefetch('subscriptions', queryset=SoftwareSubscription.objects.select_related('time_category'))
    ).aall()

    softwares_info: list[SoftwareProductInfo] = []
    for software in softwares:
        if software.file and hasattr(software.file, 'file') and software.file.file:
            file_url = software.file.file.url
        else:
            file_url = None
        subscriptions_info = []
        for sub in software.subscriptions.all():
            subscriptions_info.append(
                SoftwareSubscriptionInfo(
                    id=sub.id,
                    name=sub.name,
                    software=sub.software.id,
                    hours=sub.time_category.hours,  # Access the attribute directly
                    amount=sub.amount,
                ))
        softwares_info.append(
            SoftwareProductInfo(
                id=software.id,
                name=software.name,
                long_name=software.long_name,
                version=software.version,
                img=software.img.url if software.img else None,
                discount=software.discount,
                desc=software.desc,
                desc_short=software.desc_short,
                review_url=software.review_url,
                is_available=software.is_available,
                log_changes=software.log_changes,
                file=file_url,
                updated_at=int(software.updated_at.timestamp()),
                test_period_days=software.test_period_days,
                starts=await get_software_starts(software_id=software.id),
                subscriptions=subscriptions_info
            ))
    return sorted(softwares_info, key=lambda x: x.get('starts'), reverse=True)


async def get_software_starts(**kwargs) -> int:
    """
    Asynchronously get the sum of 'starts' for a software based on the provided filter kwargs.

    :param kwargs: Filter conditions for UserSoftwareSubscription.objects.filter(**kwargs)
    :return: Count starts of software
    """
    aggregated_data = await sync_to_async(UserSoftwareSubscription.objects.filter(**kwargs).aggregate)(
        Sum('starts')
    )
    return aggregated_data.get('starts__sum', 0)


def is_test_period_activated(**kwargs) -> bool:
    """
    :param kwargs: UserSoftwareSubscription.objects.get(**kwargs <- this)
    :return: Bool: is test period activated
    """
    try:
        return UserSoftwareSubscription.objects.get(**kwargs).is_test_period_activated
    except UserSoftwareSubscription.DoesNotExist:
        return False
