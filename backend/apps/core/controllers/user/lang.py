from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def set_lang(request):
    """
    Body: {"lang": "en" | "ru"}
    """
    lang = (request.data or {}).get('lang')
    if lang not in dict(settings.LANGUAGES):
        return Response({'detail': 'unsupported'}, status=400)

    request.user.preferred_lang = lang
    await request.user.asave(update_fields=('preferred_lang',))
    return Response({'success': True})
