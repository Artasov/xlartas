// Modules/Chat/RoomsContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {IRoom} from 'types/chat/models';
import {useChatApi} from 'Chat/useChatApi';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import pprint from 'Utils/pprint';

interface RoomsContextProps {
    rooms: IRoom[];
    loadInitialRooms: () => Promise<void>;
    loadMoreRooms: () => Promise<void>;
    updateRoom: (updatedRoom: IRoom) => void;
    initialLoading: boolean; // Добавляем состояние для первой загрузки
}

const RoomsContext = createContext<RoomsContextProps | undefined>(undefined);

export const useRooms = () => {
    const context = useContext(RoomsContext);
    if (!context) {
        throw new Error('useRooms must be used within a RoomsProvider');
    }
    return context;
};

export const RoomsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const {byResponse} = useErrorProcessing();
    const {listRooms, listRoomsByUrl} = useChatApi();
    const isLoadingRef = useRef<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true); // Состояние первой загрузки

    const loadInitialRooms = useCallback(async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setInitialLoading(true); // Начинаем начальную загрузку
        try {
            const response = await listRooms();
            pprint('Rooms fetched:', response);
            setRooms(response.results);
            setNextPageUrl(response.next);
        } catch (error) {
            byResponse(error);
        } finally {
            isLoadingRef.current = false;
            setInitialLoading(false); // Завершаем начальную загрузку
        }
    }, [byResponse, listRooms]);

    const loadMoreRooms = useCallback(async () => {
        if (nextPageUrl && !isLoadingRef.current) {
            isLoadingRef.current = true;
            try {
                const response = await listRoomsByUrl(nextPageUrl);
                pprint('More rooms fetched:', response);
                setRooms(prevRooms => [...prevRooms, ...response.results]);
                setNextPageUrl(response.next);
            } catch (error) {
                byResponse(error);
            } finally {
                isLoadingRef.current = false;
            }
        }
    }, [nextPageUrl, byResponse, listRoomsByUrl]);

    const updateRoom = useCallback((updatedRoom: IRoom) => {
        setRooms(prevRooms => {
            const roomIndex = prevRooms.findIndex(room => room.id === updatedRoom.id);
            if (roomIndex !== -1) {
                const newRooms = [...prevRooms];
                newRooms[roomIndex] = updatedRoom;
                return newRooms;
            } else {
                return [updatedRoom, ...prevRooms];
            }
        });
    }, []);

    useEffect(() => {
        if (rooms.length === 0 && !isLoadingRef.current) {
            loadInitialRooms().then();
        }
    }, [loadInitialRooms]);

    return (
        <RoomsContext.Provider value={{rooms, loadInitialRooms, loadMoreRooms, updateRoom, initialLoading}}>
            {children}
        </RoomsContext.Provider>
    );
};