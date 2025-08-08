import {useApi} from 'Api/useApi';
import {IRoom} from 'types/chat/models';

export const useChatApi = () => {
    const {api} = useApi();
    return {
        listRooms: () => api.get<{results: IRoom[]; next: string | null}>("/api/v1/rooms/"),
        listRoomsByUrl: (url: string) => api.get<{results: IRoom[]; next: string | null}>(url),
        getRoom: (roomId: number | string) => api.get(`/api/v1/rooms/${roomId}/`),
        listMessages: (roomId: number | string, url?: string) =>
            api.get(url || `/api/v1/rooms/${roomId}/messages/`),
    };
};

export type UseChatApi = ReturnType<typeof useChatApi>;
