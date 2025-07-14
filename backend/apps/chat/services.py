# chat/services.py
from typing import TYPE_CHECKING

from adjango.utils.base import AsyncAtomicContextManager
from django.db.models import Count

from utils.log import get_global_logger

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.chat.models import Room

log = get_global_logger()


class RoomService:
    @classmethod
    async def get_or_create_private(cls, participants: tuple['User', 'User']) -> tuple['Room', bool]:
        from apps.chat.models import Room
        log.info('@@@@@@@@')
        log.info('get_or_create_private')
        if len(participants) != 2:
            raise ValueError('Private room must have exactly two participants.')
        log.info(f'{participants[0].id=}')
        log.info(f'{participants[1].id=}')
        user1, user2 = participants

        async with AsyncAtomicContextManager():
            if user1 == user2:
                log.info('Сам с собой')
                room_qs = Room.objects.annotate(num_participants=Count('participants')).filter(
                    max_participants=2,
                    num_participants=1,
                    participants=user1
                )
            else:
                log.info('юзером')
                room_qs = Room.objects.filter(
                    max_participants=2,
                ).filter(participants=user1).filter(participants=user2)
            room = await room_qs.afirst()
            log.info(room)
            if room: return room, False
            room = await Room.objects.acreate(max_participants=2, name=None)
            if user1 != user2:
                await room.participants.aadd(user1, user2)
            else:
                await room.participants.aadd(user1)
            return room, True
