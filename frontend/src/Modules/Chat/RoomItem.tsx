// Modules/Chat/RoomItem.tsx
"use client";

import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useAuth} from "Auth/AuthContext";
import UserAvatar from "User/UserAvatar";
import {format, isThisYear, isToday, parseISO} from 'date-fns';
import {useTheme} from "Theme/ThemeContext";
import {useParams} from 'Utils/nextRouter';
import {IRoom} from "types/chat/models";
import {FCS, FR, FRBC, FRSC} from "wide-containers";

interface RoomItemProps {
    room: IRoom;
    onClick: () => void;
}

const RoomItem: React.FC<RoomItemProps> = ({room, onClick}) => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {plt, theme} = useTheme();
    const {roomId: currentRoomId} = useParams<{ roomId: string }>();

    const otherParticipants = useMemo(() => {
        return room.participants.filter(participant => participant.id !== user?.id);
    }, [room.participants, user?.id]);

    const roomName = useMemo(() => {
        return otherParticipants.length > 0
            ? `${otherParticipants[0].first_name} ${otherParticipants[0].last_name}`
            : t('favorites');
    }, [otherParticipants, t]);

    const avatar = useMemo(() => {
        return otherParticipants.length > 0
            ? otherParticipants[0].avatar
            : user?.avatar || null;
    }, [otherParticipants, user?.avatar]);

    const isActive = useMemo(() => {
        return currentRoomId ? Number(currentRoomId) === room.id : false;
    }, [currentRoomId, room.id]);

    const lastMessage = room.last_message;
    const lastMessageText = useMemo(() => {
        return lastMessage
            ? (lastMessage.text.length > 20 ? `${lastMessage.text.substring(0, 18)}...` : lastMessage.text)
            : '';
    }, [lastMessage]);

    const getFormattedDate = useMemo(() => {
        return (dateString: string) => {
            const date = parseISO(dateString);
            if (isToday(date)) {
                return format(date, 'HH:mm');
            } else if (isThisYear(date)) {
                return format(date, 'd MMM');
            } else {
                return format(date, 'd MMM yyyy');
            }
        };
    }, []);

    // Find first image in last message files
    const firstImage = useMemo(() => {
        return lastMessage?.files?.find((file: any) => file.type && file.type.startsWith('image/'));
    }, [lastMessage]);

    return (
        <FR
            rounded={3}
            p={1}
            g={1}
            pos={'relative'}
            className={`room-item ${isActive ? 'active-room' : ''}`}
            bg={isActive ? `${plt.text.primary}09` : `${plt.text.primary}11`}
            onClick={!isActive ? onClick : undefined}
            sx={{
                cursor: isActive ? 'default' : 'pointer',
                transition: 'background-color 0.3s, opacity 0.3s',
            }}
        >
            <UserAvatar avatar={avatar} size={'4rem'}/>
            <FCS g={1} pl={1} flexGrow={1} h={'100%'} className={'room-info'}>
                <FRSC g={1} cls={'fs-5 lh-1'} style={{
                    color: isActive
                        ? plt.text.primary
                        : plt.text.primary
                }}>
                    <span>{roomName}</span>
                    {otherParticipants.length > 0
                        ? ''
                        : <span className={'fs-7 rounded-2 px-4px pt-3px pb-4px mt-2px'} style={{
                            background: theme.colors.primary.light + '66'
                        }}>{t('notes')}</span>}
                </FRSC>
                {lastMessage && <>
                    <FRBC g={1} cls={`last-message fs-6`} color={plt.text.primary50}>
                        <FRSC>
                            {/* Avatar of the user who sent the last message */}
                            {(lastMessage.user.id !== user?.id) && <UserAvatar
                                avatar={lastMessage.user.avatar || user?.avatar}
                                size={'2rem'}
                                className={'me-2'}
                            />}
                            <span className="last-message-text">
                                {lastMessage.user.id === user?.id ? t('you_colon') : ''}
                                {lastMessageText}
                            </span>
                        </FRSC>
                    </FRBC>
                    <span className="last-message-date lh-1 fs-7 opacity-50 ms-auto">
                        {getFormattedDate(lastMessage.created_at)}
                    </span>
                </>}
                {/* Display first image from the last message, if any */}
                {firstImage && (
                    <div className="last-message-image mt-2">
                        <img
                            src={firstImage.file}
                            alt={firstImage.name}
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '5px'
                            }}
                        />
                    </div>
                )}
            </FCS>
        </FR>
    );
};

export default React.memo(RoomItem, (prevProps, nextProps) => {
    return (
        prevProps.room.id === nextProps.room.id &&
        prevProps.room.last_message?.id === nextProps.room.last_message?.id &&
        prevProps.room.participants.length === nextProps.room.participants.length
    );
});
