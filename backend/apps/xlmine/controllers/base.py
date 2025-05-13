# xlmine/controllers/base.py
import json
import logging
import os
from pprint import pprint

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
from apps.xlmine.models.user import UserXLMine
from apps.xlmine.permissions import IsMinecraftDev  # ваша кастомная permission
from apps.xlmine.serializers.base import LauncherSerializer, ReleaseSerializer, PrivilegeSerializer
from apps.xlmine.serializers.donate import DonateSerializer
from apps.xlmine.services.base import calculate_sha256

log = logging.getLogger('global')


class LauncherViewSet(ModelViewSet):
    queryset = Launcher.objects.all().order_by('-created_at')
    serializer_class = LauncherSerializer
    permission_classes = [IsMinecraftDev]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.sha256_hash = calculate_sha256(instance.file)
        instance.save()


class ReleaseViewSet(ModelViewSet):
    queryset = Release.objects.all().order_by('-created_at')
    serializer_class = ReleaseSerializer
    permission_classes = [IsMinecraftDev]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.sha256_hash = calculate_sha256(instance.file)
        instance.save()


class ChunkedReleaseUploadView(APIView):
    permission_classes = [IsMinecraftDev]

    def post(self, request):
        upload_id = request.data.get('upload_id')
        chunk_index = request.data.get('chunk_index')
        total_chunks = request.data.get('total_chunks')
        filename = request.data.get('filename')
        version_str = request.data.get('version')
        security_json_str = request.data.get('security_json')
        chunk_file = request.FILES.get('file')

        if not upload_id or chunk_index is None or not total_chunks or not filename or not chunk_file:
            log.error("Неполные данные для загрузки чанка")
            return Response({"error": "Неполные данные"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chunk_index = int(chunk_index)
            total_chunks = int(total_chunks)
        except ValueError:
            log.error(
                "Неверные значения chunk_index или total_chunks: %s, %s",
                request.data.get('chunk_index'),
                request.data.get('total_chunks')
            )
            return Response({"error": "Неверные значения chunk_index или total_chunks"},
                            status=status.HTTP_400_BAD_REQUEST)

        temp_dir = os.path.join(settings.FILE_UPLOAD_TEMP_DIR, 'chunk_uploads')
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
            log.info("Создана директория для чанков: %s", temp_dir)

        # сохраняем JSON безопасности на первой порции
        security_meta_path = os.path.join(temp_dir, f"{upload_id}_security.json")
        if chunk_index == 0 and security_json_str:
            with open(security_meta_path, 'w') as sm:
                sm.write(security_json_str)

        # сохраняем сам чанк
        chunk_path = os.path.join(temp_dir, f"{upload_id}_{chunk_index}")
        with open(chunk_path, 'wb') as f:
            for data in chunk_file.chunks():
                f.write(data)
        log.info(
            "Сохранён чанк %s из %s для upload_id %s",
            chunk_index + 1, total_chunks, upload_id
        )

        # если последний чанк — склеиваем и создаём объект Release
        if chunk_index == total_chunks - 1:
            final_path = os.path.join(temp_dir, f"{upload_id}_{filename}")
            with open(final_path, 'wb') as final_file:
                for i in range(total_chunks):
                    part = os.path.join(temp_dir, f"{upload_id}_{i}")
                    if not os.path.exists(part):
                        log.error("Отсутствует чанк %s для upload_id %s", i, upload_id)
                        return Response(
                            {"error": f"Отсутствует чанк {i}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    with open(part, 'rb') as cf:
                        final_file.write(cf.read())
                    os.remove(part)
                    log.info(
                        "Чанк %s удалён после сборки для upload_id %s",
                        i + 1, upload_id
                    )

            # если на последнем нет JSON — читаем из файла мета
            if not security_json_str and os.path.exists(security_meta_path):
                with open(security_meta_path, 'r') as sm:
                    security_json_str = sm.read()

            # удаляем мета-файл
            if os.path.exists(security_meta_path):
                os.remove(security_meta_path)

            log.info("Собран файл: %s. Создаём объект Release.", final_path)
            with open(final_path, 'rb') as final_file_obj:
                django_file = File(final_file_obj, name=filename)
                release = Release.objects.create(
                    file=django_file,
                    security=json.loads(security_json_str) if security_json_str else None,
                    version=version_str
                )
                release.sha256_hash = calculate_sha256(release.file)
                release.save()
            os.remove(final_path)
            log.info("Финальный файл %s удалён после создания объекта Release", final_path)

            serializer = ReleaseSerializer(release)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {"status": f"Получен чанк {chunk_index + 1} из {total_chunks}"},
                status=status.HTTP_200_OK
            )


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


@acontroller('Get latest security')
async def get_latest_release_security(_):
    try:
        r: Release | None = await Release.objects.alatest('created_at')
        if r is not None:
            return JsonResponse(r.security, safe=False)
    except Release.DoesNotExist:
        return JsonResponse({})


@acontroller('Get current privilege')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_current_privilege(request):
    xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=request.user)
    pprint(xlmine_user.__dict__)
    pprint(hasattr(xlmine_user, 'privilege_id'))
    privilege = await xlmine_user.arelated('privilege') if getattr(xlmine_user, 'privilege_id') else None
    return Response({
        'privilege': await PrivilegeSerializer(privilege).adata if privilege else None,
        'total_donate_amount': float(await request.user.sum_donate_amount()),
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
