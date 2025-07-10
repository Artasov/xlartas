# chat/consumers/chat.py

import base64
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.files.base import ContentFile

from apps.chat.models import Room, Message, File
from apps.chat.serializers import MessageSerializer
from apps.core.models import User
from apps.notify.models import Notify
from apps.notify.registry import Notifies

log = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_id = None
        self.room_group_name = None
        self.room = None

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.room = await self.get_room(self.room_id)
        if self.room and self.scope['user'].is_authenticated:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        if data['type'] == 'read_message':
            await self.mark_message_as_read(data['message_id'])
        elif data['type'] == 'chat_message':
            log.debug('Received data: %s', data)
            temp_id = data.get('tempId')
            message_text = data.get('message', '')
            is_important = data.get('is_important', False)  # Get is_important flag
            user = self.scope['user']
            files_data = data.get('files', [])
            if user.is_authenticated:
                message = await self.create_message(user, self.room, message_text, files_data, is_important)
                serialized_message = await MessageSerializer(message).adata
                message_data = {
                    **serialized_message,
                    'tempId': temp_id,
                    'action': 'confirm_message_saved'
                }
                if is_important:
                    # Send notification for important message
                    recipient = await self.get_recipient(self.room, user)
                    log.debug('Recipient for notification: %s', recipient)
                    if recipient:
                        await Notify.objects.acreate(
                            recipient=recipient,
                            notify_type=Notifies.IMPORTANT_CHAT_MESSAGE,
                            send_immediately=True,
                        )
                await self.channel_layer.group_send(
                    self.room_group_name, {
                        'type': 'chat_message',
                        'message': message_data,
                    }
                )
        else:
            log.warning('Unknown request to consumer: %s', data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @staticmethod
    async def get_room(room_id) -> Room:
        return await Room.objects.aget(id=room_id)

    @staticmethod
    async def get_recipient(room: Room, sender) -> User | None:
        # Assuming one-to-one room
        participants = await room.participants.aall()
        log.debug('Participants: %s, sender: %s', participants, sender)
        for participant in participants:
            if participant != sender:
                return participant
        return None

    @staticmethod
    async def create_message(user, room, message_text, files_data, is_important):
        message = await Message.objects.acreate(user=user, room=room, text=message_text, is_important=is_important)
        for file_data in files_data:
            # Проверяем, что 'data' является строкой
            data_field = file_data.get('data')
            if not isinstance(data_field, str):
                raise TypeError(f'Expected "data" to be string, got {type(data_field)}')

            # Decode Base64 data
            file_content = base64.b64decode(data_field)
            # Create ContentFile
            content_file = ContentFile(file_content, name=file_data['name'])
            # Create and save File instance
            file_instance = await File.objects.acreate(file=content_file)
            # Add file to message
            await message.files.aadd(file_instance)
        await message.asave()
        return message

    @staticmethod
    async def message_to_json(message):
        return await MessageSerializer(message).adata

    async def mark_message_as_read(self, message_id):
        message = await Message.objects.aget(id=message_id)
        if not message.is_read:
            message.is_read = True
            await message.asave()
            await self.channel_layer.group_send(
                f'chat_{message.room_id}', {
                    'type': 'chat_message',
                    'message': {
                        **await MessageSerializer(message).adata,
                        'action': 'read_message'
                    },
                }
            )
