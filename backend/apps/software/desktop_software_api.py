# shop/desktop_software_api.py

import json
import logging

from adrf.decorators import api_view
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import User
from apps.software.models import Software, SoftwareLicense

log = logging.getLogger('global')

# Эти константы замените своими сообщениями
SOMETHING_WRONG = 'Something went wrong.'
LOGIN_OR_SECRET_KEY_WRONG = 'Wrong username or secret key.'
MULTI_ACCOUNT_PROHIBITED = 'Multi account usage with the same HWID is prohibited.'
HWID_NOT_EQUAL = 'Your HWID does not match the HWID saved for this account.'
PRODUCT_NOT_EXISTS = 'Requested software product does not exist.'
LICENSE_TIMEOUT = 'Your license has expired. Visit {} to renew.'
# Для примера:
URL_SHOP_SOFTWARE = '/software/'  # TODO: генерировать ссылку на запрашиваемый продукт /softwares/:id


@csrf_exempt
@api_view(('POST',))
@permission_classes((AllowAny,))
async def software_auth(request) -> Response:
    """
    Старая логика авторизации софта, адаптированная под новые модели.
    """
    data = json.loads(request.body or '{}')

    username = data.get('username')
    secret_key = data.get('secret_key')
    hw_id = data.get('hw_id')
    software_name = data.get('product')
    is_first_license_checking = data.get('is_first_license_checking')

    # Проверяем обязательные поля
    if not all((hw_id, software_name, str(is_first_license_checking))):
        log.info("[software_auth] Missing fields.")
        return Response(
            {'accept': False, 'error': SOMETHING_WRONG},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    # Ищем пользователя
    try:
        user_ = await User.objects.aget(username=username, secret_key=secret_key)
    except User.DoesNotExist:
        log.info(f"[software_auth] User does not exist or secret_key mismatch: {username}")
        return Response(
            {'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    # Проверяем, не используется ли один hw_id на нескольких разных аккаунтах
    # (исключаем самого user_, чтобы не учитывать его собственную запись)
    other_hwid_count = await User.objects.filter(hw_id=hw_id).exclude(pk=user_.pk).acount()
    if other_hwid_count > 0:
        log.info(f"[software_auth] Multi account prohibited. user_id={user_.id}, hw_id={hw_id}")
        return Response(
            {'accept': False, 'error': MULTI_ACCOUNT_PROHIBITED},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    is_first_start = False

    # Если у пользователя нет hw_id, присваиваем
    if not user_.hw_id:
        user_.hw_id = hw_id
        await user_.asave()
        is_first_start = True
        log.info(f"[software_auth] First time setting hw_id for user {user_.id}.")
    else:
        # Если hw_id у юзера есть, но он отличается
        if hw_id != user_.hw_id:
            log.info(f"[software_auth] HWID mismatch user:{user_.id}")
            return Response(
                {'accept': False, 'error': HWID_NOT_EQUAL, 'error_type': 'hw_id'},
                status=status.HTTP_200_OK,
                headers={'Content-Type': 'application/json'}
            )

    # Ищем Software
    try:
        software_ = await Software.objects.aget(name=software_name)
    except Software.DoesNotExist:
        log.info(f"[software_auth] Software not found: {software_name}")
        return Response(
            {'accept': False, 'error': PRODUCT_NOT_EXISTS},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    # Создаем или получаем SoftwareLicense
    license_obj, _ = await SoftwareLicense.objects.aget_or_create(
        user=user_,
        software=software_
    )

    now = timezone.now()
    # Проверяем, активна ли лицензия
    if not license_obj.license_ends_at or license_obj.license_ends_at <= now:
        # Например, разрешаем частичную активацию для "xLUMRA"
        if software_name == 'xLUMRA':
            # Если пользователь только что запустил и is_first_license_checking
            # возможно хотим обновить какие-то поля (например, счётчик запусков).
            if is_first_license_checking:
                # Допустим, ничего не делаем, либо вы можете делать:
                # license_obj.updated_at = now  # или что-то подобное
                await license_obj.asave()
            return Response(
                {
                    'accept': True,
                    'full_license': False,
                    'hw_id': user_.hw_id,
                    'is_first_start': is_first_start
                },
                headers={'Content-Type': 'application/json'},
                status=status.HTTP_200_OK
            )
        else:
            # Полная лицензия просрочена:
            shop_link = request.build_absolute_uri(URL_SHOP_SOFTWARE)
            return Response(
                {
                    'accept': False,
                    'error': LICENSE_TIMEOUT.format(
                        f'<a style="color: white;" href="{shop_link}">shop</a>'
                    )
                },
                status=status.HTTP_200_OK,
                headers={'Content-Type': 'application/json'}
            )

    # Если лицензия активна:
    # Если нужно, увеличиваем какой-нибудь счётчик запусков/использований:
    if is_first_license_checking:
        # Можно завести поле license_obj.usage_count += 1 и т.д.
        # Пример:
        # license_obj.usage_count = (license_obj.usage_count or 0) + 1
        # license_obj.updated_at = now
        await license_obj.asave()

    return Response(
        {
            'accept': True,
            'full_license': True,
            'hw_id': user_.hw_id,
            'is_first_start': is_first_start
        },
        headers={'Content-Type': 'application/json'},
        status=status.HTTP_200_OK
    )


@csrf_exempt
@api_view(('POST',))
@permission_classes((AllowAny,))
async def set_user_hw_id(request) -> Response:
    """
    Устанавливаем HWID и сбрасываем (продлеваем или заканчиваем) лицензии.
    В старой логике все лицензии юзера сразу истекают при смене hw_id.
    """
    data = json.loads(request.body or '{}')
    username = data.get('username')
    secret_key = data.get('secret_key')
    hw_id = data.get('hw_id')

    if not all((username, secret_key, hw_id)):
        log.info("[set_user_hw_id] Missing fields or invalid request.")
        return Response(
            {'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    try:
        user_ = await User.objects.aget(username=username, secret_key=secret_key)
    except User.DoesNotExist:
        log.info(f"[set_user_hw_id] User not found or secret key mismatch: {username}")
        return Response(
            {'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
            status=status.HTTP_200_OK,
            headers={'Content-Type': 'application/json'}
        )

    user_.hw_id = hw_id
    await user_.asave()

    # По старой логике все лицензии юзера обнуляем (устанавливаем license_ends_at=now)
    # тем самым "блокируя" дальше использование без новой покупки/продления
    now = timezone.now()
    await SoftwareLicense.objects.filter(user=user_).aupdate(license_ends_at=now)

    return Response(
        {'accept': True},
        headers={'Content-Type': 'application/json'}
    )


@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_software_version(request, software_name: str) -> Response:
    try:
        software_ = await Software.objects.select_related('file').aget(name=software_name)
        if not software_.file:
            return Response(
                {
                    "version": None,
                    "url": None
                },
                status=status.HTTP_200_OK
            )

        # ВАЖНО: возвращаем абсолютный путь:
        absolute_url = request.build_absolute_uri(software_.file.file.url)

        return Response(
            {
                "version": software_.file.version,
                "url": absolute_url
            },
            status=status.HTTP_200_OK
        )
    except Software.DoesNotExist:
        return Response(
            {"detail": "Software does not exist."},
            status=status.HTTP_404_NOT_FOUND
        )
