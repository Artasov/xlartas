// Modules/Chat/RoomsContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {IRoom} from 'types/chat/models';
import {axios} from '../Api/axiosConfig';
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
    const isLoadingRef = useRef<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true); // Состояние первой загрузки

    const loadInitialRooms = useCallback(async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setInitialLoading(true); // Начинаем начальную загрузку
        try {
            const response = await axios.get('/api/v1/rooms/');
            pprint('Rooms fetched:', response.data);
            setRooms(response.data.results);
            setNextPageUrl(response.data.next);
        } catch (error) {
            byResponse(error);
        } finally {
            isLoadingRef.current = false;
            setInitialLoading(false); // Завершаем начальную загрузку
        }
    }, [byResponse]);

    const loadMoreRooms = useCallback(async () => {
        if (nextPageUrl && !isLoadingRef.current) {
            isLoadingRef.current = true;
            try {
                const response = await axios.get(nextPageUrl);
                pprint('More rooms fetched:', response.data);
                setRooms(prevRooms => [...prevRooms, ...response.data.results]);
                setNextPageUrl(response.data.next);
            } catch (error) {
                byResponse(error);
            } finally {
                isLoadingRef.current = false;
            }
        }
    }, [nextPageUrl, byResponse]);

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
            loadInitialRooms();
        }
    }, [loadInitialRooms]);

    return (
        <RoomsContext.Provider value={{rooms, loadInitialRooms, loadMoreRooms, updateRoom, initialLoading}}>
            {children}
        </RoomsContext.Provider>
    );
};