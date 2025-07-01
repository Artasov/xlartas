from __future__ import annotations

from django.utils import translation
from django.utils.cache import patch_vary_headers


class UserPreferredLocale:
    """
    1. Если пользователь авторизован и у него заполнено preferred_lang → активируем его.
    2. Иначе берём первый Accept-Language, который поддерживается.
    3. Fallback – settings.LANGUAGE_CODE.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    async def __call__(self, request):
        # ── 1) язык из профиля ────────────────────────────────
        lang = getattr(getattr(request, 'user', None), 'preferred_lang', None)

        # ── 2) Accept-Language ────────────────────────────────
        if not lang:
            lang = translation.get_language_from_request(request, check_path=False)

        translation.activate(lang or 'ru')
        request.LANGUAGE_CODE = translation.get_language()

        response = await self.get_response(request)

        # чтобы кэш CDN корректно различал языки
        patch_vary_headers(response, ('Accept-Language',))
        translation.deactivate()
        return response
