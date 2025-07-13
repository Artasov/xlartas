from celery import shared_task


@shared_task
def process_conversion_task(conversion_id: int) -> None:
    from apps.converter.models import Conversion
    from apps.converter.services import ConversionService

    conversion = Conversion.objects.get(id=conversion_id)
    service = ConversionService(conversion)
    import asyncio
    asyncio.run(service.perform())
