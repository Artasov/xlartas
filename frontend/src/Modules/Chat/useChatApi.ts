import {useApi} from 'Api/useApi';
import {useMemo} from 'react';
import {IRoom} from 'types/chat/models';

export const useChatApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        listRooms: () => api.get<{ results: IRoom[]; next: string | null }>("/api/v1/rooms/"),
        listRoomsByUrl: (url: string) => api.get<{ results: IRoom[]; next: string | null }>(url),
        getRoom: (roomId: number | string) => api.get(`/api/v1/rooms/${roomId}/`),
        getPersonalRoomWith: (userId: number | string) => api.get<IRoom>(`/api/v1/rooms/personal/with/${userId}/`),
        listMessages: (roomId: number | string, url?: string) =>
            api.get(url || `/api/v1/rooms/${roomId}/messages/`),
    }), [api]);
};

export type UseChatApi = ReturnType<typeof useChatApi>;
