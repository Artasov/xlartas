from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.shop.services.subscription import UserInfo, get_user_subscriptions


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
async def current_user_subscriptions(request) -> Response:
    user = request.user
    user_info = UserInfo(
        username=user.username,
        email=user.email,
        subscriptions=await get_user_subscriptions(user)
    )
    return Response(user_info)
