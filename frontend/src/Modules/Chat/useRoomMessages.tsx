// Modules/Chat/useRoomMessages.tsx

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {parseISO} from 'date-fns';
import DateLabel from './DateLabel';
import {IMessage} from 'types/chat/models';

interface UseRoomMessagesParams {
    roomId?: string;
    api: any;
}

const useRoomMessages = ({roomId, api}: UseRoomMessagesParams) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const messagesRef = useRef<IMessage[]>(messages);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const isInitialLoad = useRef<boolean>(true);
    const prevScrollHeightRef = useRef<number>(0);
    const isFetchingRef = useRef<boolean>(false);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const fetchMessages = useCallback(async (url: string | null = null) => {
        if (isLoadingMore || isFetchingRef.current) return;
        if (url === null && !isInitialLoad.current) return;
        if (!roomId) return;
        isFetchingRef.current = true;
        setIsLoadingMore(true);
        if (url && messagesContainerRef.current) {
            prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
        }
        api.get(url || `/api/v1/rooms/${roomId}/messages/`).then((data: any) => {
            setMessages(prev => {
                const newMessages = data.results.filter((msg: IMessage) => !prev.some(e => e.id === msg.id));
                return [...newMessages, ...prev];
            });
            setNextPageUrl(data.next);

            if (isInitialLoad.current && !url) {
                setTimeout(() => {
                    messagesContainerRef.current?.scrollTo({
                        top: messagesContainerRef.current.scrollHeight,
                        behavior: 'auto',
                    });
                }, 100);
                isInitialLoad.current = false;
            } else if (url && messagesContainerRef.current) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
                    }
                }, 100);
            }
        }).finally(() => {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        });
    }, [roomId, api, isLoadingMore]);

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
        const container = messagesContainerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => {
            container?.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    useLayoutEffect(() => {
        if (!isLoadingMore && !isInitialLoad.current) {
            messagesContainerRef.current?.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isLoadingMore]);

    useEffect(() => {
        return () => {
            messages.forEach(message => {
                message.files.forEach((file: any) => {
                    if (file.file && typeof file.file === 'string' && file.file.startsWith('blob:')) {
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

    const reset = useCallback(() => {
        setMessages([]);
        setNextPageUrl(null);
        isInitialLoad.current = true;
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
        }
    }, []);

    return {
        messages,
        setMessages,
        messagesEndRef,
        messagesContainerRef,
        isLoadingMore,
        renderDateLabel,
        fetchMessages,
        reset,
        messagesRef,
    };
};

export default useRoomMessages;
