# chat/controllers/room.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework import viewsets
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND

from apps.chat.models import Room, Message
from apps.chat.permissions import IsParticipant
from apps.chat.serializers import RoomSerializer, MessageSerializer
from apps.core.exceptions.user import UserException
from apps.core.models import User


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated, IsParticipant]

    def get_queryset(self):
        return Room.objects.filter(participants=self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, _request, _pk=None):
        room = self.get_object()
        messages = Message.objects.select_related(
            'user',
            'room',
        ).prefetch_related(
            'files'
        ).filter(room=room).order_by('-created_at')
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            data = list(serializer.data)
            data.reverse()
            return self.get_paginated_response(data)

        serializer = MessageSerializer(messages, many=True)
        data = list(serializer.data)
        data.reverse()
        return Response(data)


@acontroller('Personal room with user by ID')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def personal_room_with_user(request, user_id: int):
    room, created = await Room.get_or_create_private((
        request.user,
        await User.objects.agetorn(UserException.NotFound, id=user_id)
    ))
    if not room: Response(status=HTTP_404_NOT_FOUND)
    return Response(await RoomSerializer(room).adata, status=HTTP_200_OK)
