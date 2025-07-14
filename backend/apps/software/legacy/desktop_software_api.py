# software/legacy/desktop_software_api.py

import json

from adrf.decorators import api_view
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import User
from apps.software.models import Software, SoftwareLicense
from utils.log import get_global_logger
from .utils import get_user_by_credentials, json_response

log = get_global_logger()

# Эти константы замените своими сообщениями
SOMETHING_WRONG = 'Something went wrong.'
LOGIN_OR_SECRET_KEY_WRONG = 'Wrong username or secret key.'
MULTI_ACCOUNT_PROHIBITED = 'Multi account usage with the same HWID is prohibited.'
HWID_NOT_EQUAL = 'Your HWID does not match the HWID saved for this account.'
PRODUCT_NOT_EXISTS = 'Requested software product does not exist.'
LICENSE_TIMEOUT = 'Your license has expired. Visit {} to renew.'


# Для примера ссылку на страницу продукта генерируем динамически
def get_shop_url(software_id: int) -> str:
    """Return relative URL to the software detail page."""
    return f'/softwares/{software_id}/'


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
        log.info('[software_auth] Missing fields.')
        return json_response({'accept': False, 'error': SOMETHING_WRONG})

    # Ищем пользователя
    user_ = await get_user_by_credentials(username=username, secret_key=secret_key)
    if not user_:
        log.info(f'[software_auth] User does not exist or secret_key mismatch: {username}')
        return json_response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG})

    # Проверяем, не используется ли один hw_id на нескольких разных аккаунтах
    # (исключаем самого user_, чтобы не учитывать его собственную запись)
    other_hwid_count = await User.objects.filter(hw_id=hw_id).exclude(pk=user_.pk).acount()
    if other_hwid_count > 0:
        log.info(f'[software_auth] Multi account prohibited. user_id={user_.id}, hw_id={hw_id}')
        return json_response({'accept': False, 'error': MULTI_ACCOUNT_PROHIBITED})

    is_first_start = False

    # Если у пользователя нет hw_id, присваиваем
    if not user_.hw_id:
        user_.hw_id = hw_id
        await user_.asave()
        is_first_start = True
        log.info(f'[software_auth] First time setting hw_id for user {user_.id}.')
    else:
        # Если hw_id у юзера есть, но он отличается
        if hw_id != user_.hw_id:
            log.info(f'[software_auth] HWID mismatch user:{user_.id}')
            return json_response({'accept': False, 'error': HWID_NOT_EQUAL, 'error_type': 'hw_id'})

    # Ищем Software
    try:
        software_ = await Software.objects.aget(name=software_name)
    except Software.DoesNotExist:
        log.info(f'[software_auth] Software not found: {software_name}')
        return json_response({'accept': False, 'error': PRODUCT_NOT_EXISTS})

    # Создаем или получаем SoftwareLicense
    license_obj, _ = await SoftwareLicense.objects.aget_or_create(
        user=user_,
        software=software_
    )

    now = timezone.now()
    # Проверяем, активна ли лицензия
    if not license_obj.license_ends_at or license_obj.license_ends_at <= now:
        # Например, разрешаем частичную активацию для 'xLUMRA'
        if software_name == 'xLUMRA':
            # Если пользователь только что запустил и is_first_license_checking
            # возможно хотим обновить какие-то поля (например, счётчик запусков).
            if is_first_license_checking:
                # Допустим, ничего не делаем, либо вы можете делать:
                # license_obj.updated_at = now  # или что-то подобное
                await license_obj.asave()
            return json_response({
                'accept': True,
                'full_license': False,
                'hw_id': user_.hw_id,
                'is_first_start': is_first_start
            })
        else:
            # Полная лицензия просрочена:
            shop_link = request.build_absolute_uri(get_shop_url(software_.id))
            return json_response({
                'accept': False,
                'error': LICENSE_TIMEOUT.format(
                    f'<a style="color: white;" href="{shop_link}">shop</a>'
                )
            })

    # Если лицензия активна:
    # Если нужно, увеличиваем какой-нибудь счётчик запусков/использований:
    if is_first_license_checking:
        # Можно завести поле license_obj.usage_count += 1 и т.д.
        # Пример:
        # license_obj.usage_count = (license_obj.usage_count or 0) + 1
        # license_obj.updated_at = now
        await license_obj.asave()

    return json_response({
        'accept': True,
        'full_license': True,
        'hw_id': user_.hw_id,
        'is_first_start': is_first_start
    })


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
        log.info('[set_user_hw_id] Missing fields or invalid request.')
        return json_response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG})

    user_ = await get_user_by_credentials(username=username, secret_key=secret_key)
    if not user_:
        log.info(f'[set_user_hw_id] User not found or secret key mismatch: {username}')
        return json_response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG})

    user_.hw_id = hw_id
    await user_.asave()

    # По старой логике все лицензии юзера обнуляем (устанавливаем license_ends_at=now)
    # тем самым 'блокируя' дальше использование без новой покупки/продления
    now = timezone.now()
    await SoftwareLicense.objects.filter(user=user_).aupdate(license_ends_at=now)

    return json_response({'accept': True})


@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_software_version(request, software_name: str) -> Response:
    try:
        software_ = await Software.objects.select_related('file').aget(name=software_name)
        if not software_.file:
            return json_response({'version': None, 'url': None})

        # ВАЖНО: возвращаем абсолютный путь:
        absolute_url = request.build_absolute_uri(software_.file.file.url)

        return json_response({'version': software_.file.version, 'url': absolute_url})
    except Software.DoesNotExist:
        return json_response({'detail': 'Software does not exist.'}, status_code=status.HTTP_404_NOT_FOUND)
