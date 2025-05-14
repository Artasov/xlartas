# chat/factories/all.py
from attr import Factory

from apps.chat.models import Room


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
