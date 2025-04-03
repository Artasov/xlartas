# xlmine/controllers/base.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.http import JsonResponse
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.xlmine.models import Launcher, Release, DonateProduct, Privilege
from apps.xlmine.permissions import IsMinecraftDev
from apps.xlmine.serializers.base import LauncherSerializer, ReleaseSerializer, PrivilegeSerializer
from apps.xlmine.serializers.donate import DonateProductSerializer
from apps.xlmine.services.base import calculate_sha256, increment_version


class LauncherViewSet(ModelViewSet):
    queryset = Launcher.objects.all().order_by('-created_at')
    serializer_class = LauncherSerializer
    permission_classes = [IsMinecraftDev]

    def perform_create(self, serializer):
        instance = serializer.save()
        # Вычисляем SHA256 по загруженному файлу
        instance.sha256_hash = calculate_sha256(instance.file)
        # Генерируем новую версию: если есть предыдущая – увеличиваем, иначе "1.0.0"
        latest = Launcher.objects.exclude(pk=instance.pk).order_by('-created_at').first()
        if latest and latest.version:
            instance.version = increment_version(latest.version)
        else:
            instance.version = "1.0.0"
        instance.save()


class ReleaseViewSet(ModelViewSet):
    queryset = Release.objects.all().order_by('-created_at')
    serializer_class = ReleaseSerializer
    permission_classes = [IsMinecraftDev]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.sha256_hash = calculate_sha256(instance.file)
        latest = Release.objects.exclude(pk=instance.pk).order_by('-created_at').first()
        if latest and latest.version:
            instance.version = increment_version(latest.version)
        else:
            instance.version = "1.0.0"
        instance.save()


@acontroller('Get latest launcher')
async def get_latest_launcher(_):
    try:
        return JsonResponse(await LauncherSerializer(await Launcher.objects.alatest('created_at')).adata)
    except Launcher.DoesNotExist:
        return JsonResponse({})


@acontroller('Get latest release')
async def get_latest_release(_):
    try:
        return JsonResponse(await ReleaseSerializer(await Release.objects.alatest('created_at')).adata)
    except Release.DoesNotExist:
        return JsonResponse({})


@acontroller('Get current privilege')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_current_privilege(request):
    privilege = await request.user.privilege()
    if not privilege: return Response({"privilege": None})
    return Response(await PrivilegeSerializer(privilege).adata)


@acontroller('Get latest donate product')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_donate_product(_):
    donate_product = await DonateProduct.objects.latest('id')
    if not donate_product: return Response(None)
    return Response(await DonateProductSerializer(donate_product).adata)


@acontroller('List privileges')
@api_view(['GET'])
@permission_classes((AllowAny,))
async def list_privileges(_):
    privileges = await Privilege.objects.aall()
    return Response(await PrivilegeSerializer(privileges, many=True).adata)
