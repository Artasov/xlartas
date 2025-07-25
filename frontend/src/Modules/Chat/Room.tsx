// Modules/Chat/Room.tsx
import React, {RefObject, useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {useAuth} from 'Auth/AuthContext';
import Divider from 'Core/components/elements/Divider';
import {Message as ToastMessage} from 'Core/components/Message';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {IMessage, IRoom} from 'types/chat/models';
import {FC} from 'wide-containers';
import MessageInput from 'Chat/MessageInput';

import RoomHeader from './RoomHeader';
import MessagesList from './MessagesList';
import useRoomMessages from './useRoomMessages';
import useRoomSocket from './useRoomSocket';
import {useNavigation} from 'Core/components/Header/HeaderProvider';
import {useApi} from 'Api/useApi';

interface RoomProps {
    room?: IRoom | null;
    roomId?: string;
    showHeader?: boolean;
}

const Room: React.FC<RoomProps> = ({room: roomProp, roomId: propRoomId, showHeader}) => {
    const {roomId: routeRoomId} = useParams<{ roomId: string }>();
    const roomId = propRoomId ?? routeRoomId;
    const {headerNavHeight} = useNavigation();
    const [room, setRoom] = useState<IRoom | null>(roomProp ?? null);
    const {isAuthenticated: authStatus, user} = useAuth();
    const isAuthenticated = authStatus ?? false;
    const {notAuthentication} = useErrorProcessing();
    const {api} = useApi();
    const {t} = useTranslation();

    const {
        messages,
        setMessages,
        messagesEndRef,
        messagesContainerRef,
        isLoadingMore,
        renderDateLabel,
        fetchMessages,
        reset,
        messagesRef,
    } = useRoomMessages({roomId, api});

    const sendMessage = useRoomSocket({
        roomId: roomId || '',
        isAuthenticated,
        userId: user?.id || null,
        setMessages,
    });

    const fetchRoom = useCallback(async () => {
        if (roomProp || !roomId) return;
        api.get(`/api/v1/rooms/${roomId}/`).then(data => setRoom(data));
    }, [roomId, api, roomProp]);

    useEffect(() => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }
        if (roomId) {
            fetchMessages().then();
            fetchRoom().then();
        }
    }, [roomId, fetchMessages, fetchRoom, notAuthentication, isAuthenticated]);

    useEffect(() => {
        reset();
    }, [roomId, reset]);

    const base64ToBlob = useCallback((base64: string, type: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type});
    }, []);

    const handleSendMessage = useCallback((messageText: string, attachedFiles: any[], isImportant: boolean) => {
        if (!user) {
            ToastMessage.error(t('not_authorized'));
            return;
        }
        const tempId = 'temp_' + new Date().toISOString();
        const messagePayload = {
            type: 'chat_message',
            room: roomId,
            message: messageText,
            files: attachedFiles,
            is_important: isImportant,
            tempId,
        };
        const tempMessage: IMessage = {
            id: null,
            tempId,
            room: Number(roomId),
            text: messageText,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar: user.avatar,
            },
            files: attachedFiles.map(file => {
                const blob = base64ToBlob(file.data, file.type);
                const url = URL.createObjectURL(blob);
                return {id: null, name: file.name, type: file.type, size: file.size, file: url};
            }),
            created_at: new Date().toISOString(),
            is_read: false,
            is_important: isImportant,
            status: 'sending',
        };
        setMessages(prev => [...prev, tempMessage]);
        if (sendMessage) {
            sendMessage(JSON.stringify(messagePayload));
        } else {
            ToastMessage.error(t('websocket_not_connected'));
        }
    }, [roomId, user, base64ToBlob, sendMessage]);

    const handleFileChange = useCallback((_updatedFiles: File[]) => {
    }, []);

    const handleMarkAsRead = useCallback((message: IMessage) => {
        if (user && user.id !== message.user.id && !message.is_read) {
            const readPayload = {type: 'read_message', message_id: message.id};
            if (sendMessage) {
                sendMessage(JSON.stringify(readPayload));
            }
        }
    }, [user, sendMessage]);

    const handleMarkAsReadForAll = useCallback(() => {
        messagesRef.current.forEach(m => handleMarkAsRead(m));
    }, [handleMarkAsRead, messagesRef]);

    useEffect(() => {
        if (isAuthenticated && room) {
            handleMarkAsReadForAll();
        }
    }, [messages, isAuthenticated, room, handleMarkAsReadForAll]);

    return (
        <FC h={'100%'} cls={'room'} maxH={`calc(100vh - ${headerNavHeight}px)`}>
            {showHeader && <>
                <RoomHeader room={room}/>
                <Divider width={'90%'}/>
            </>}
            <MessagesList
                messages={messages}
                room={room}
                renderDateLabel={renderDateLabel}
                isLoadingMore={isLoadingMore}
                messagesEndRef={messagesEndRef as RefObject<HTMLDivElement>}
                messagesContainerRef={messagesContainerRef as RefObject<HTMLDivElement>}
            />
            <FC px={1} pb={1}>
                <FC rounded={3} px={1} pt={1} pb={1}>
                    <MessageInput onSend={handleSendMessage} onFileChange={handleFileChange}/>
                </FC>
            </FC>
        </FC>
    );
};

export default Room;
