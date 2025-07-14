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
