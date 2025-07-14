from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from apps.converter.models import Conversion
from apps.converter.serializers import ConversionSerializer


class ConversionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversion_id = self.scope['url_route']['kwargs']['conversion_id']
        self.group_name = f'conversion_{self.conversion_id}'
        conversion = await self._get_conversion()
        await self.accept()
        if conversion.is_done:
            await self.send_json({
                'event': 'conversion_done',
                'conversion': await self._serialize(conversion),
            })
            await self.close()
        else:
            await self.channel_layer.group_add(self.group_name, self.channel_name)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def conversion_done(self, event):
        await self.send_json({
            'event': 'conversion_done',
            'conversion': event['conversion'],
        })
        await self.close()

    @database_sync_to_async
    def _get_conversion(self):
        return Conversion.objects.get(id=self.conversion_id)

    @database_sync_to_async
    def _serialize(self, conversion):
        return ConversionSerializer(conversion).data
