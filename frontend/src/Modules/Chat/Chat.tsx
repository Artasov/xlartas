// Modules/Chat/Chat.tsx
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import RoomItem from 'Chat/RoomItem';
import {useMediaQuery} from '@mui/material';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {useRooms} from './RoomsContext';
import {IRoom} from "types/chat/models";
import CircularProgress from "Core/components/elements/CircularProgress";
import {FC, FCSC} from "wide-containers";
import {useNavigation} from "Core/components/Header/HeaderProvider";

const Chat: React.FC = () => {
    const {rooms, loadMoreRooms, initialLoading} = useRooms();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const location = useLocation();
    const isMdOrLarger = useMediaQuery('(min-width: 992px)');
    const {notAuthentication} = useErrorProcessing();

    const {
        headerNavHeight,
    } = useNavigation();
    useEffect(() => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }
    }, [isAuthenticated, notAuthentication]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const {scrollTop} = e.currentTarget;
        const isTop = scrollTop === 0;
        if (isTop && rooms.length > 0 && !isLoading) {
            setIsLoading(true);
            loadMoreRooms().finally(() => setIsLoading(false));
        }
    };

    const handleRoomClick = (roomId: number) => {
        navigate(`/chats/room/${roomId}`);
    };

    const isRoomView = location.pathname.includes('/room/');

    const sortedRooms = useMemo(() => {
        if (!user) return rooms;
        const specialRoomIndex = rooms.findIndex((room: IRoom) =>
            room.participants.length === 1 && room.participants[0].id === user.id
        );
        if (specialRoomIndex === -1) {
            return rooms;
        }
        const specialRoom = rooms[specialRoomIndex];
        const otherRooms = [...rooms];
        otherRooms.splice(specialRoomIndex, 1);
        return [specialRoom, ...otherRooms];
    }, [rooms, user]);

    // Логика отображения:
    // 1) Если initialLoading = true, показываем индикатор загрузки.
    // 2) Если initialLoading = false и комнат нет, показываем сообщение.
    // 3) Если комнаты есть, показываем список.

    const showRooms = !initialLoading && Array.isArray(sortedRooms) && sortedRooms.length > 0;
    const showNoRoomsMessage = !initialLoading && (!Array.isArray(sortedRooms) || sortedRooms.length === 0);

    return (
        <div className={`chat h-100 w-100 ${isMdOrLarger ? 'fr' : 'fc'}`}>
            {initialLoading
                ? <CircularProgress size={'120px'}/>
                : (isMdOrLarger || !isRoomView) && showRooms
                    ? <FC cls={'rooms'} g={1} minW={350} p={2} maxH={`calc(100vh - ${headerNavHeight}px)`}
                          scroll={'y-auto'} onScroll={handleScroll}>
                        {sortedRooms.map(room => (
                            <RoomItem key={room.id} room={room} onClick={() => handleRoomClick(room.id)}/>
                        ))}
                        {isLoading && <p>Loading...</p>}
                    </FC>
                    : showNoRoomsMessage &&
                    <FCSC g={1} p={2} scroll={'y-auto'}
                          cls={'no-scrollbar'} textAlign={'center'}>
                        <p>Ни одного чата</p>
                    </FCSC>
            }
            {!initialLoading && !isLoading && (isMdOrLarger || isRoomView) && (
                <FC flexGrow={1} w={'100%'} minW={350}>
                    <Outlet/>
                </FC>
            )}
        </div>
    );
};

export default Chat;