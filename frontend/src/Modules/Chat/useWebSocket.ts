// Modules/Chat/useWebSocket.ts

import {useCallback, useEffect, useRef} from 'react';
import {axios} from '../Api/axiosConfig';
import {isTokenExpiringSoon} from 'Utils/jwt';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {useRooms} from './RoomsContext';
import pprint from 'Utils/pprint';

interface UseWebSocketProps {
    roomId: string;
    isAuthenticated: boolean;
    userId: number | null;
    onMessage: (data: any) => void;
}

const useWebSocket = ({roomId, isAuthenticated, userId, onMessage}: UseWebSocketProps) => {
    const ws = useRef<WebSocket | null>(null);
    const {byResponse} = useErrorProcessing();
    const {updateRoom} = useRooms();

    useEffect(() => {
        if (!isAuthenticated || !roomId) return;

        // Предотвращаем множественные подключения
        if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
            pprint('WebSocket уже подключен или подключается.');
            return;
        }

        const connectWebSocket = async () => {
            let token: string | null = localStorage.getItem('access') || null;

            if (token && isTokenExpiringSoon(token)) {
                try {
                    const response = await axios.post('/api/v1/token/refresh/', {
                        refresh: localStorage.getItem('refresh'),
                    });
                    localStorage.setItem('access', response.data.access);
                    token = response.data.access;
                } catch (error) {
                    byResponse(error);
                    return;
                }
            }

            const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/${roomId}/?token=${token}`;
            ws.current = new WebSocket(wsUrl);

            const handleOpen = (event: Event) => {
                pprint('WebSocket connected');
            };

            const handleMessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                pprint('WebSocket message received:', data);
                onMessage(data);
            };

            const handleClose = (event: CloseEvent) => {
                pprint('WebSocket closed:', event);
            };

            const handleError = (error: Event) => {
                pprint('WebSocket error:', error);
                byResponse(new Error('WebSocket error'));
            };

            ws.current.onopen = handleOpen;
            ws.current.onmessage = handleMessage;
            ws.current.onclose = handleClose;
            ws.current.onerror = handleError;
        };

        connectWebSocket();

        // Очистка при размонтировании или изменении зависимостей
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [roomId, isAuthenticated, byResponse, onMessage]);

    // Функция для отправки сообщений через WebSocket
    const sendMessage = useCallback((message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        } else {
            pprint('WebSocket не открыт. Текущее состояние:', ws.current?.readyState);
        }
    }, []);

    return sendMessage;
};

export default useWebSocket;
