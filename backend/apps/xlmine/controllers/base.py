# xlmine/controllers/base.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.xlmine.models import Launcher, Release, calculate_sha256, increment_version
from apps.xlmine.permissions import IsMinecraftDev
from apps.xlmine.serializers import LauncherSerializer, ReleaseSerializer


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
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_launcher(_):
    try:
        return await LauncherSerializer(await Launcher.objects.alatest('created_at')).adata
    except Launcher.DoesNotExist:
        return Response({})


@acontroller('Get latest release')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_release(_):
    try:
        return await ReleaseSerializer(await Release.objects.alatest('created_at')).adata
    except Release.DoesNotExist:
        return Response({})
