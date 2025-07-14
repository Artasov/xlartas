from celery import shared_task


@shared_task
def process_conversion_task(conversion_id: int) -> None:
    from apps.converter.models import Conversion
    from apps.converter.services import ConversionService
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from apps.converter.serializers import ConversionSerializer

    conversion = Conversion.objects.get(id=conversion_id)
    service = ConversionService(conversion)
    import asyncio
    asyncio.run(service.perform())
    conversion.refresh_from_db()
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'conversion_{conversion_id}',
        {
            'type': 'conversion.done',
            'conversion': ConversionSerializer(conversion).data,
        }
    )


@shared_task
def cleanup_conversions() -> None:
    from django.utils import timezone
    from datetime import timedelta
    from django.conf import settings
    from apps.converter.models import Conversion

    threshold = timezone.now() - timedelta(days=settings.CONVERTER_FILE_RETENTION_DAYS)
    qs = Conversion.objects.filter(created_at__lt=threshold)
    for conv in qs:
        if conv.input_file:
            conv.input_file.delete(save=False)
        if conv.output_file:
            conv.output_file.delete(save=False)
    qs.delete()
