// Modules/Chat/RoomWith.tsx
"use client";

import React, {useEffect, useState} from 'react';
import {useAuth} from 'Auth/AuthContext';
import Room from './Room';
import {IRoom} from 'types/chat/models';
import {useChatApi} from './useChatApi';

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
    const {getPersonalRoomWith} = useChatApi();

    useEffect(() => {
        if (!userId) {
            setRoom(null);
            return;
        }
        getPersonalRoomWith(userId).then(data => setRoom(data));
    }, [userId, getPersonalRoomWith]);

    if (!room || !isAuthenticated) return null;
    return <Room key={room.id} showHeader={!!showHeader} roomId={String(room.id)} room={room}/>;
};

export default RoomWith;
