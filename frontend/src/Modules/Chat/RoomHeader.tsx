// Modules/Chat/RoomHeader.tsx
"use client";

import React, {useMemo} from 'react';
import {IconButton, useMediaQuery} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import UserAvatar from "User/UserAvatar";
import {Link, useNavigate} from 'Utils/nextRouter';
import {useAuth} from "Auth/AuthContext";
import {IRoom} from "types/chat/models";
import {useTheme} from "Theme/ThemeContext";
import {FRSC} from "wide-containers";
import {useProfile} from "User/ProfileContext";
import {useTranslation} from "react-i18next";

interface RoomHeaderProps {
    room: IRoom | null;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({room}) => {
    const navigate = useNavigate();
    const {selectedProfile} = useProfile();
    const {user} = useAuth();
    const {plt} = useTheme();
    const isMdOrLarger = useMediaQuery('(min-width: 992px)');
    const {t} = useTranslation();

    const otherParticipant = useMemo(() => {
        if (!room || room.max_participants !== 2) return null;
        return room.participants.find(p => p.id !== user?.id) || null;
    }, [room, user]);

    const roomName = useMemo(() => {
        if (!room) return '';
        if (room.max_participants === 2) {
            return otherParticipant
                ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                : t('favorites');
        }
        return room.name || '';
    }, [room, otherParticipant, t]);

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
    }, [selectedProfile, otherParticipant, user]);

    return (
        <FRSC g={1} w={'100%'} mb={1} cls={'pb-1 px-3 pt-3'}>
            {!isMdOrLarger && (
                <IconButton className={'p-0'} onClick={() => navigate(-1)}>
                    <ArrowBackIosNewRoundedIcon/>
                </IconButton>
            )}
            {room && room.max_participants === 2 && otherParticipant
                ? <Link to={room && roomName === t('favorites')
                    ? '/profile' : profileLink}>
                    <UserAvatar
                        size={'3.4rem'}
                        avatar={otherParticipant.avatar}
                    />
                </Link>
                : room ?
                    ''
                    : <CircularProgressZoomify in/>
            }
            <Link to={room && roomName === t('favorites')
                ? '/profile' : profileLink}>
                <h4 className={'m-0 ps-1 tdn'} style={{color: plt.text.primary}}>
                    {room ? roomName : <CircularProgressZoomify in/>}
                </h4>
            </Link>
        </FRSC>
    );
};

export default React.memo(RoomHeader);
