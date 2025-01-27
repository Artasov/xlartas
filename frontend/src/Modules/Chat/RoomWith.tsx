// Chat/RoomWith.tsx

import React, {useContext, useEffect, useState} from 'react';
import {axios} from 'Auth/axiosConfig';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import pprint from 'Utils/pprint';
import Room from './Room';
import {IRoom} from 'types/chat/models';

interface RoomWithProps {
    userId?: number;
    showHeader?: boolean;
}

const RoomWith: React.FC<RoomWithProps> = (
    {
        userId,
        showHeader,
    }) => {

    const {byResponse} = useErrorProcessing();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const [room, setRoom] = useState<IRoom | null>(null);

    useEffect(() => {
        if (!userId) {
            setRoom(null);
            return;
        }
        axios.get(`api/v1/rooms/personal/with/${userId}/`
        ).then((response) => {
            pprint(`Personal room with user ID: ${userId}`, response.data);
            setRoom(response.data);
        }).catch((error) => byResponse(error));
    }, [userId, byResponse]);
    if (!room || !isAuthenticated) return null;
    return <Room key={room.id} showHeader={showHeader ? true : false} roomId={String(room.id)} room={room}/>;
};

export default RoomWith;
