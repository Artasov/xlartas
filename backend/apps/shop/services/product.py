from asgiref.sync import sync_to_async
from django.core.exceptions import BadRequest
from django.db.models import Sum, Prefetch

from apps.shop.funcs import add_license_time
from apps.shop.models import UserSoftwareSubscription, SoftwareProduct, SoftwareProductInfo, SoftwareSubscriptionInfo, \
    SoftwareSubscription


# def execute_buy_product_program()


async def get_softwares(**kwargs) -> list[SoftwareProductInfo]:
    # Преобразуем QuerySet в список асинхронно
    softwares = await sync_to_async(list)(
        SoftwareProduct.objects.filter(**kwargs).select_related('file').prefetch_related(
            Prefetch('subscriptions', queryset=SoftwareSubscription.objects.select_related('time_category'))
        )
    )
    products_info = []

    for software in softwares:
        file_url = software.file.file.url if software.file and hasattr(software.file, 'file') else None
        subscriptions_info = []

        for sub in software.subscriptions.all():
            # Нет необходимости использовать sync_to_async для доступа к атрибутам модели здесь
            subscriptions_info.append(
                SoftwareSubscriptionInfo(
                    id=sub.id,
                    name=sub.name,
                    software=sub.software.id,
                    hours=sub.time_category.hours,  # Доступ к атрибуту напрямую
                    priceRub=sub.priceRub,
                ))

        products_info.append(
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
                starts=await get_software_product_starts(software_id=software.id),
                subscriptions=subscriptions_info
            ))

    return products_info


async def get_software_product_starts(**kwargs) -> int:
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


def activate_test_period(user_id: int, product_name: str):
    license_, _ = UserSoftwareSubscription.objects.get_or_create(
        user_id=user_id,
        product_id=SoftwareProduct.objects.get(name=product_name).id)
    if license_.is_test_period_activated:
        raise BadRequest
    try:
        product_ = SoftwareProduct.objects.get(name=product_name)
    except SoftwareProduct.DoesNotExist:
        raise BadRequest
    license_.is_test_period_activated = True
    add_license_time(user_id, product_.id, product_.test_period_days)
