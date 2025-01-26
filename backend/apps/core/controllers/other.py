import logging

from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.async_django import aall
from apps.core.models.common import Theme
from apps.core.serializers.other import ThemeSerializer
from adjango.adecorators import acontroller

log = logging.getLogger('global')


@acontroller('Get theme list')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def theme_list(request) -> Response:
    return Response(await ThemeSerializer(await aall(Theme.objects), many=True).adata)
