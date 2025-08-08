# converter/consumers/conversion.py
from typing import Any, Dict, Optional

from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.converter.models import Conversion
from apps.converter.serializers import ConversionSerializer


class ConversionConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.conversion_id: Optional[str] = None
        self.group_name: Optional[str] = None

    async def connect(self) -> None:
        self.conversion_id = self.scope.get('url_route', {}).get('kwargs', {}).get('conversion_id')
        if not self.conversion_id:
            await self.close(code=4000)
            return

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
            # group_name гарантированно не None здесь
            await self.channel_layer.group_add(self.group_name, self.channel_name)

    async def disconnect(self, close_code: int) -> None:
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def conversion_done(self, event: Dict[str, Any]) -> None:
        await self.send_json({
            'event': 'conversion_done',
            'conversion': event['conversion'],
        })
        await self.close()

    async def _get_conversion(self) -> Conversion:
        assert self.conversion_id is not None
        return await Conversion.objects.aget(id=self.conversion_id)

    @staticmethod
    async def _serialize(conversion: Conversion) -> Dict[str, Any]:
        return await ConversionSerializer(conversion).adata
