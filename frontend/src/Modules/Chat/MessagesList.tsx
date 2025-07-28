// Modules/Chat/MessagesList.tsx

import React from 'react';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC, FCCC, FCE} from "wide-containers";
import RoomMessage from "Chat/RoomMessage";
import {IMessage, IRoom} from "types/chat/models";
import {useTheme} from "Theme/ThemeContext";
import {useAuth} from "Auth/AuthContext";
import {useTranslation} from "react-i18next";

interface MessagesListProps {
    messages: IMessage[];
    room: IRoom | null;
    renderDateLabel: (message: IMessage, previousMessage?: IMessage) => React.ReactNode;
    isLoadingMore: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const MessagesList: React.FC<MessagesListProps> = (
    {
        messages,
        room,
        renderDateLabel,
        isLoadingMore,
        messagesEndRef,
        messagesContainerRef
    }) => {
    const {user} = useAuth();
    const {t} = useTranslation();

    const {plt, theme} = useTheme();
    const isSelfDialog = (room: IRoom | null): boolean => {
        if (!room || !user) return false;
        if (room.participants.length !== 2) return false;
        // Check if both participants are the same as the current user
        return room.participants.every(participant => participant.id === user.id);
    };
    return (
        <FC
            flexGrow={1}
            scroll={'y-auto'}
            px={2}
            ref={messagesContainerRef}
            cls={'no-scrollbar'}
            style={{overflowY: 'auto', display: 'flex', flexDirection: 'column'}}
        >
            {room ? (
                <FCE
                    flexGrow={1}
                    g={1}
                    py={1}
                    cls={`messages`}
                    boxShadow={plt.shadows ? plt.shadows.SO005 : ''}
                    style={{display: 'flex', flexDirection: 'column'}}
                >
                    {isLoadingMore && <CircularProgressZoomify in/>}
                    {messages.length > 0
                        ? messages.map((message, index) => (
                            <React.Fragment key={message.id || index}>
                                {renderDateLabel(message, messages[index - 1])}
                                <RoomMessage message={message} room_capacity={room.max_participants}/>
                            </React.Fragment>
                        ))
                        : <FCCC p={2} textAlign={'center'} mx={'auto'} rounded={4}
                                fontWeight={'bold'} fontSize={22}
                                bg={theme.colors.secondary.lighter}
                                color={plt.text.primary}>
                            {t('start_writing_first')}
                        </FCCC>
                    }
                    <div ref={messagesEndRef}></div>
                </FCE>
            ) : (
                <CircularProgressZoomify in/>
            )}
        </FC>
    );
};

export default React.memo(MessagesList);
