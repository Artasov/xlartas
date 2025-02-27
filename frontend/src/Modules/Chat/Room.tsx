// Modules/Chat/Room.tsx
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
///////Скопировать заново с нормального места//////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState,} from 'react';
import {useParams} from 'react-router-dom';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import Divider from 'Core/components/elements/Divider';
import {parseISO} from 'date-fns';
import {Message as ToastMessage} from 'Core/components/Message';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {IMessage, IRoom} from 'types/chat/models';
import {FC} from 'WideLayout/Layouts';
import MessageInput from 'Chat/MessageInput';
import {useRooms} from './RoomsContext';
import RoomHeader from './RoomHeader';
import MessagesContainer from './MessagesContainer';
import DateLabel from './DateLabel';
import useWebSocket from './useWebSocket';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {useApi} from "../Api/useApi";

interface RoomProps {
    /** Если хотим передать комнату напрямую (чтобы не делать запрос на получение Room). */
    room?: IRoom | null;
    /** ID комнаты (обычно строка из URL) */
    roomId?: string;
    showHeader?: boolean;
}

const Room: React.FC<RoomProps> = (
    {
        room: roomProp,
        roomId: propRoomId,
        showHeader,
    }) => {
    const {roomId: routeRoomId} = useParams<{ roomId: string }>();
    const roomId = propRoomId ?? routeRoomId;
    const {headerNavHeight} = useNavigation();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [room, setRoom] = useState<IRoom | null>(roomProp ?? null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const {isAuthenticated: authStatus, user} =
        useContext(AuthContext) as AuthContextType;
    const isAuthenticated = authStatus ?? false; // Обеспечиваем, что это всегда boolean
    const {notAuthentication} = useErrorProcessing();
    const {updateRoom} = useRooms();
    const {api} = useApi();
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const isInitialLoad = useRef<boolean>(true);
    const prevScrollHeightRef = useRef<number>(0);
    const messagesRef = useRef<IMessage[]>(messages);
    const isFetchingRef = useRef<boolean>(false); // Ref для предотвращения множественных запросов

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const base64ToBlob = useCallback((base64: string, type: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type});
    }, []);

    const fetchMessages = useCallback(
        async (url: string | null = null) => {
            if (isLoadingMore || isFetchingRef.current) return;
            if (url === null && !isInitialLoad.current) return;
            if (!roomId) return;
            isFetchingRef.current = true;
            setIsLoadingMore(true);
            if (url && messagesContainerRef.current) {
                prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            }
            api.get(url || `/api/v1/rooms/${roomId}/messages/`).then(data => {
                setMessages((prevMessages) => {
                    const newMessages = data.results.filter(
                        (msg: IMessage) => !prevMessages.some((existing) => existing.id === msg.id)
                    );
                    return [...newMessages, ...prevMessages];
                });
                setNextPageUrl(data.next);

                // При первой загрузке скроллим вниз
                if (isInitialLoad.current && !url) {
                    setTimeout(() => {
                        messagesContainerRef.current?.scrollTo({
                            top: messagesContainerRef.current.scrollHeight,
                            behavior: 'auto',
                        });
                    }, 100);
                    isInitialLoad.current = false;
                } else if (url && messagesContainerRef.current) {
                    // Если догружаем историю (скроллим вверх)
                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            const newScrollHeight = messagesContainerRef.current.scrollHeight;
                            messagesContainerRef.current.scrollTop =
                                newScrollHeight - prevScrollHeightRef.current;
                        }
                    }, 100);
                }
            }).finally(() => {
                setIsLoadingMore(false);
                isFetchingRef.current = false;
            })
        },
        [roomId, api, isLoadingMore]
    );

    const fetchRoom = useCallback(async () => {
        if (roomProp || !roomId) return;
        api.get(`/api/v1/rooms/${roomId}/`).then(data => setRoom(data));
    }, [roomId, api, roomProp]);

    const handleWebSocketMessage = useCallback(
        (data: any) => {
            if (data.action === 'confirm_message_saved') {
                setMessages((prevMessages) => {
                    const index = prevMessages.findIndex(
                        (msg) => msg.id === data.tempId || msg.tempId === data.tempId
                    );
                    if (index !== -1) {
                        const newMessages = [...prevMessages];
                        newMessages[index] = {...data, status: 'sent'};
                        return newMessages;
                    } else {
                        return [...prevMessages, data];
                    }
                });

                if (data.room) {
                    updateRoom(data.room);
                }
            } else if (data.action === 'read_message') {
                setMessages((prevMessages) => {
                    const index = prevMessages.findIndex((msg) => msg.id === data.id);
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
        },
        [updateRoom]
    );

    const sendMessage = useWebSocket({
        roomId: roomId || '',
        isAuthenticated,
        userId: user?.id || null,
        onMessage: handleWebSocketMessage,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }

        // Загружаем сообщения
        if (roomId) {
            fetchMessages().then();
            // Загружаем информацию о комнате, если нет готовой
            fetchRoom().then();
        }
    }, [roomId, fetchMessages, fetchRoom, notAuthentication, isAuthenticated]);

    // При смене roomId сбрасываем сообщения и состояние
    useEffect(() => {
        setMessages([]);
        setNextPageUrl(null);
        isInitialLoad.current = true;
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
        }
    }, [roomId]);

    const handleSendMessage = useCallback(
        async (messageText: string, attachedFiles: any[], isImportant: boolean) => {
            if (!user) {
                ToastMessage.error('Вы не авторизованы!');
                return;
            }

            const tempId = 'temp_' + new Date().toISOString();

            const messagePayload = {
                type: 'chat_message',
                room: roomId,
                message: messageText,
                files: attachedFiles,
                is_important: isImportant,
                tempId: tempId,
            };

            const tempMessage: IMessage = {
                id: null,
                tempId: tempId,
                room: Number(roomId),
                text: messageText,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar,
                },
                files: attachedFiles.map((file) => {
                    const blob = base64ToBlob(file.data, file.type);
                    const url = URL.createObjectURL(blob);
                    return {
                        id: null,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        file: url,
                    };
                }),
                created_at: new Date().toISOString(),
                is_read: false,
                is_important: isImportant,
                status: 'sending',
            };

            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            if (sendMessage) {
                sendMessage(JSON.stringify(messagePayload));
            } else {
                ToastMessage.error('WebSocket не подключен.');
            }
        },
        [roomId, user, base64ToBlob, sendMessage]
    );

    const handleFileChange = useCallback((_updatedFiles: File[]) => {
        // Дополнительная логика при необходимости
    }, []);

    useLayoutEffect(() => {
        if (!isLoadingMore && !isInitialLoad.current) {
            messagesContainerRef.current?.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isLoadingMore]);

    // Очищаем blob-URL при размонтировании
    useEffect(() => {
        return () => {
            messages.forEach((message) => {
                message.files.forEach((file: any) => {
                    if (file.file.startsWith('blob:')) {
                        URL.revokeObjectURL(file.file);
                    }
                });
            });
        };
    }, [messages]);

    const renderDateLabel = useCallback((message: IMessage, previousMessage?: IMessage) => {
        const messageDate = parseISO(message.created_at);
        if (!previousMessage) {
            return <DateLabel key={`date-${message.id}`} date={message.created_at}/>;
        }

        const previousMessageDate = parseISO(previousMessage.created_at);
        if (messageDate.getDate() !== previousMessageDate.getDate()) {
            return <DateLabel key={`date-${message.id}`} date={message.created_at}/>;
        }

        return null;
    }, []);

    const handleMarkAsRead = useCallback(
        (message: IMessage) => {
            if (user && user.id !== message.user.id && !message.is_read) {
                const readPayload = {type: 'read_message', message_id: message.id};
                if (sendMessage) {
                    sendMessage(JSON.stringify(readPayload));
                }
            }
        },
        [user, sendMessage]
    );

    const handleMarkAsReadForAll = useCallback(() => {
        messagesRef.current.forEach((message) => handleMarkAsRead(message));
    }, [handleMarkAsRead]);

    useEffect(() => {
        if (isAuthenticated && room) {
            handleMarkAsReadForAll();
        }
    }, [messages, isAuthenticated, room, handleMarkAsReadForAll]);

    const handleScroll = useCallback(() => {
        if (
            messagesContainerRef.current?.scrollTop === 0 &&
            nextPageUrl &&
            !isLoadingMore &&
            !isFetchingRef.current
        ) {
            fetchMessages(nextPageUrl).then();
        }
    }, [fetchMessages, nextPageUrl, isLoadingMore]);

    useEffect(() => {
        if (room) {
            const container = messagesContainerRef.current;
            container?.addEventListener('scroll', handleScroll);
            return () => {
                container?.removeEventListener('scroll', handleScroll);
            };
        }
    }, [room, handleScroll]);

    return (
        <FC h={'100%'} cls={'room'} maxH={`calc(100vh - ${headerNavHeight}px)`}>
            {/* Заголовок комнаты */}
            {showHeader && <>
                <RoomHeader room={room}/>
                <Divider width={'90%'}/>
            </>}

            {/* Контейнер сообщений */}
            <MessagesContainer
                messages={messages}
                room={room}
                renderDateLabel={renderDateLabel}
                isLoadingMore={isLoadingMore}
                messagesEndRef={messagesEndRef}
                messagesContainerRef={messagesContainerRef}
            />

            {/* Поле ввода сообщения */}
            <FC px={1} pb={1}>
                <FC rounded={3} px={1} pt={1} pb={1}>
                    <MessageInput onSend={handleSendMessage} onFileChange={handleFileChange}/>
                </FC>
            </FC>
        </FC>
    );
};

export default Room;
