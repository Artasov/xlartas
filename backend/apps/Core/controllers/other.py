import logging

from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.Core.async_django import aall
from apps.Core.models.common import Theme
from apps.Core.serializers.other import ThemeSerializer
from apps.Core.services.base import acontroller

log = logging.getLogger('base')


@acontroller('Get theme list')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def theme_list(request) -> Response:
    serializer = ThemeSerializer(await aall(Theme.objects), many=True)
    return Response(await serializer.adata)
