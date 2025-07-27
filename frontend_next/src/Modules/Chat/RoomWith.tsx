// Modules/Chat/RoomWith.tsx

import React, {useEffect, useState} from 'react';
import {useAuth} from 'Auth/AuthContext';
import Room from './Room';
import {IRoom} from 'types/chat/models';
import {useApi} from "Api/useApi";

interface RoomWithProps {
    userId?: number;
    showHeader?: boolean;
}

const RoomWith: React.FC<RoomWithProps> = (
    {
        userId,
        showHeader,
    }) => {

    const {isAuthenticated} = useAuth();
    const [room, setRoom] = useState<IRoom | null>(null);
    const {api} = useApi();

    useEffect(() => {
        if (!userId) {
            setRoom(null);
            return;
        }
        api.get(`api/v1/rooms/personal/with/${userId}/`).then(data => setRoom(data));
    }, [userId, api]);

    if (!room || !isAuthenticated) return null;
    return <Room key={room.id} showHeader={!!showHeader} roomId={String(room.id)} room={room}/>;
};

export default RoomWith;
