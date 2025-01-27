# chat/factories/all.py
from apps.chat.models import Message
from apps.chat.models import Room
from apps.core.factories.base import Factory
from apps.core.factories.user import UserFactory


class MessageFactory(Factory):
    model = Message

    @classmethod
    async def acreate(cls, user=None, room=None, **kwargs):
        """
        Создание сообщения с привязанным пользователем и комнатой.
        """
        if user is None:
            user = await UserFactory.acreate()
        if room is None:
            room = await RoomFactory.acreate()
        return await super().acreate(user=user, room=room, **kwargs)


class RoomFactory(Factory):
    model = Room

    @classmethod
    async def acreate(cls, participants=None, **kwargs):
        """
        Создание комнаты с участниками.
        """
        room = await super().acreate(**kwargs)
        if participants:
            await room.participants.aset(participants)
        return room
