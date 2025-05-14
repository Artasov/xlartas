# theme/controllers/base.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.theme.models import Theme
from apps.theme.serializers.serializers import ThemeSerializer


@acontroller('Get theme list')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def theme_list(_) -> Response:
    return Response(await ThemeSerializer(await Theme.objects.aall(), many=True).adata)
