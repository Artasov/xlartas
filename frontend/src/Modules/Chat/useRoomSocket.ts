// Modules/Chat/useRoomSocket.ts
"use client";

import {useCallback} from 'react';
import {IMessage} from 'types/chat/models';
import {useRooms} from './RoomsContext';
import useWebSocket from './useWebSocket';

interface UseRoomSocketProps {
    roomId: string;
    isAuthenticated: boolean;
    userId: number | null;
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
}

const useRoomSocket = ({roomId, isAuthenticated, userId, setMessages}: UseRoomSocketProps) => {
    const {updateRoom} = useRooms();

    const handleWebSocketMessage = useCallback((data: any) => {
        if (data.action === 'confirm_message_saved') {
            setMessages(prevMessages => {
                const index = prevMessages.findIndex(msg => msg.id === data.tempId || msg.tempId === data.tempId);
                if (index !== -1) {
                    const newMessages = [...prevMessages];
                    newMessages[index] = {...data, status: 'sent'};
                    return newMessages;
                }
                return [...prevMessages, data];
            });
            if (data.room) {
                updateRoom(data.room);
            }
        } else if (data.action === 'read_message') {
            setMessages(prevMessages => {
                const index = prevMessages.findIndex(msg => msg.id === data.id);
                if (index !== -1) {
                    const newMessages = [...prevMessages];
                    newMessages[index] = {...newMessages[index], is_read: true};
                    return newMessages;
                }
                return prevMessages;
            });
            if (data.room) {
                updateRoom(data.room);
            }
        }
    }, [setMessages, updateRoom]);

    return useWebSocket({roomId, isAuthenticated, userId, onMessage: handleWebSocketMessage});
};

export default useRoomSocket;
