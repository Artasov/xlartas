# xlmine/controllers/skin_cape.py
from adrf.decorators import api_view
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.xlmine.models.user import UserXLMine


@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def upload_skin(request):
    skin_file = request.FILES.get('skin')
    if not skin_file:
        return Response({"detail": "skin file is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        await request.user.set_skin(skin_file)
        xlm = await UserXLMine.objects.aget(user=request.user)
        return Response({"skin": settings.DOMAIN_URL + xlm.skin.url}, status=status.HTTP_200_OK)
    except ConnectionRefusedError:
        return Response({"detail": "Update error"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def upload_cape(request):
    cape_file = request.FILES.get('cape')
    if not cape_file:
        return Response({"detail": "cape file is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        await request.user.set_cape(cape_file)
        xlm = await UserXLMine.objects.aget(user=request.user)
        return Response({"cape": settings.DOMAIN_URL + xlm.cape.url}, status=status.HTTP_200_OK)
    except ConnectionRefusedError:
        return Response({"detail": "Update error"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def current_skin_cape(request):
    from apps.xlmine.models.user import UserXLMine
    xlm, _ = await UserXLMine.objects.aget_or_create(user=request.user)
    skin = xlm.skin.url if xlm.skin else None
    cape = xlm.cape.url if xlm.cape else None
    return Response({'skin': skin, 'cape': cape})
