// Modules/Chat/RoomHeader.tsx

import React, {useContext, useMemo} from 'react';
import {CircularProgress, IconButton, useMediaQuery} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import UserAvatar from "User/UserAvatar";
import {Link, useNavigate} from 'react-router-dom';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {IRoom} from "types/chat/models";
import {useTheme} from "Theme/ThemeContext";
import {FRSC} from "WideLayout/Layouts";
import {useProfile} from "User/ProfileContext";

interface RoomHeaderProps {
    room: IRoom | null;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({room}) => {
    const navigate = useNavigate();
    const {selectedProfile} = useProfile();
    const {user} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();
    const isMdOrLarger = useMediaQuery('(min-width: 992px)');

    const otherParticipant = useMemo(() => {
        if (!room || room.max_participants !== 2) return null;
        return room.participants.find(p => p.id !== user?.id) || null;
    }, [room, user]);

    const roomName = useMemo(() => {
        if (!room) return '';
        if (room.max_participants === 2) {
            return otherParticipant
                ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                : 'Избранное';
        }
        return room.name || '';
    }, [room, otherParticipant]);

    const profileLink = useMemo(() => {
        if (!otherParticipant) return '#';
        if (otherParticipant.id === user?.id) {
            return `/profile`;
        }
        if (selectedProfile === 'employee') {
            return `/clients/${otherParticipant.id}`;
        } else {
            return `/employee/${otherParticipant.id}`;
        }
    }, [selectedProfile, otherParticipant]);

    return (
        <FRSC g={1} w={'100%'} mb={1} cls={'pb-1 px-3 pt-3'}>
            {!isMdOrLarger && (
                <IconButton className={'p-0'} onClick={() => navigate(-1)}>
                    <ArrowBackIosNewRoundedIcon/>
                </IconButton>
            )}
            {room && room.max_participants === 2 && otherParticipant
                ? <Link to={room && roomName === 'Избранное'
                    ? '/profile' : profileLink}>
                    <UserAvatar
                        size={'3.4rem'}
                        avatar={otherParticipant.avatar}
                    />
                </Link>
                : room ?
                    ''
                    : <CircularProgress/>
            }
            <Link className={'tdn'} style={{
                color: plt.text.primary60
            }} to={room && roomName === 'Избранное'
                ? '/profile' : profileLink}>
                <h4 className={'m-0 ps-1'}>
                    {room ? roomName : <CircularProgress/>}
                </h4>
            </Link>
        </FRSC>
    );
};

export default React.memo(RoomHeader);
