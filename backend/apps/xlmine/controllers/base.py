# xlmine/controllers/base.py
import logging
import os

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.conf import settings
from django.core.files import File
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.xlmine.models import Launcher, Donate, Privilege
from apps.xlmine.models import Release
from apps.xlmine.permissions import IsMinecraftDev  # ваша кастомная permission
from apps.xlmine.serializers.base import LauncherSerializer, ReleaseSerializer, PrivilegeSerializer
from apps.xlmine.serializers.donate import DonateSerializer
from apps.xlmine.services.base import calculate_sha256, increment_version

log = logging.getLogger('global')


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
        print(self.request.upload_handlers)
        instance = serializer.save()
        instance.sha256_hash = calculate_sha256(instance.file)
        latest = Release.objects.exclude(pk=instance.pk).order_by('-created_at').first()
        if latest and latest.version:
            instance.version = increment_version(latest.version)
        else:
            instance.version = "1.0.0"
        instance.save()


class ChunkedReleaseUploadView(APIView):
    permission_classes = [IsMinecraftDev]

    def post(self, request):
        upload_id = request.data.get('upload_id')
        chunk_index = request.data.get('chunk_index')
        total_chunks = request.data.get('total_chunks')
        filename = request.data.get('filename')
        chunk_file = request.FILES.get('file')

        if not upload_id or chunk_index is None or not total_chunks or not filename or not chunk_file:
            log.error("Неполные данные для загрузки чанка")
            return Response({"error": "Неполные данные"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            chunk_index = int(chunk_index)
            total_chunks = int(total_chunks)
        except ValueError:
            log.error("Неверные значения chunk_index или total_chunks: %s, %s", request.data.get('chunk_index'), request.data.get('total_chunks'))
            return Response({"error": "Неверные значения chunk_index или total_chunks"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Директория для хранения временных чанков
        temp_dir = os.path.join(settings.FILE_UPLOAD_TEMP_DIR, 'chunk_uploads')
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
            log.info("Создана директория для чанков: %s", temp_dir)

        # Сохраняем текущий чанк
        chunk_path = os.path.join(temp_dir, f"{upload_id}_{chunk_index}")
        with open(chunk_path, 'wb') as f:
            for data in chunk_file.chunks():
                f.write(data)
        log.info("Сохранён чанк %s из %s для upload_id %s", chunk_index + 1, total_chunks, upload_id)

        # Если получен последний чанк, собираем все части в один файл
        if chunk_index == total_chunks - 1:
            log.info("Получен последний чанк (%s/%s) для upload_id %s. Начинаем сборку файла.", chunk_index + 1, total_chunks, upload_id)
            final_path = os.path.join(temp_dir, f"{upload_id}_{filename}")
            with open(final_path, 'wb') as final_file:
                for i in range(total_chunks):
                    chunk_i_path = os.path.join(temp_dir, f"{upload_id}_{i}")
                    if not os.path.exists(chunk_i_path):
                        log.error("Отсутствует чанк %s для upload_id %s", i, upload_id)
                        return Response({"error": f"Отсутствует чанк {i}"}, status=status.HTTP_400_BAD_REQUEST)
                    with open(chunk_i_path, 'rb') as cf:
                        final_file.write(cf.read())
                    os.remove(chunk_i_path)
                    log.info("Чанк %s удалён после сборки для upload_id %s", i + 1, upload_id)

            # Создаем объект Release на основе собранного файла
            log.info("Собран файл: %s. Создаём объект Release.", final_path)
            with open(final_path, 'rb') as final_file_obj:
                django_file = File(final_file_obj, name=filename)
                release = Release.objects.create(file=django_file)
                # Определяем версию
                latest = Release.objects.exclude(pk=release.pk).order_by('-created_at').first()
                if latest and latest.version:
                    release.version = increment_version(latest.version)
                else:
                    release.version = "1.0.0"
                # Вычисляем SHA256 (при необходимости)
                release.sha256_hash = calculate_sha256(release.file)
                release.save()
            os.remove(final_path)
            log.info("Финальный файл %s удалён после создания объекта Release", final_path)

            serializer = ReleaseSerializer(release)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            log.info("Чанк %s из %s для upload_id %s получен и сохранён.", chunk_index + 1, total_chunks, upload_id)
            return Response({"status": f"Получен чанк {chunk_index + 1} из {total_chunks}"}, status=status.HTTP_200_OK)


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
    sum_donate_amount = await request.user.sum_donate_amount()
    privilege = await Privilege.objects.get_by_threshold(sum_donate_amount)
    return Response({
        'privilege': await PrivilegeSerializer(privilege).adata if privilege else None,
        'total_donate_amount': float(sum_donate_amount),
    })


@acontroller('Get latest donate product')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_donate_product(_):
    try:
        donate_product = await Donate.objects.alatest('id')
    except Donate.DoesNotExist:
        raise Donate.ApiEx.DoesNotExist()
    if not donate_product: return Response(None)
    return Response(await DonateSerializer(donate_product).adata)


@acontroller('List privileges')
@api_view(['GET'])
@permission_classes((AllowAny,))
async def list_privileges(_):
    privileges = await Privilege.objects.aall()
    return Response(await PrivilegeSerializer(privileges, many=True).adata)
