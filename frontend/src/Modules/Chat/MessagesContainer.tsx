// Modules/Chat/MessagesContainer.tsx

import React, {useContext} from 'react';
import {CircularProgress} from '@mui/material';
import {FC, FCCC, FCE} from "WideLayout/Layouts";
import RoomMessage from "Chat/RoomMessage";
import {IMessage, IRoom} from "types/chat/models";
import {useTheme} from "Theme/ThemeContext";
import {AuthContext, AuthContextType} from "Auth/AuthContext";

interface MessagesContainerProps {
    messages: IMessage[];
    room: IRoom | null;
    renderDateLabel: (message: IMessage, previousMessage?: IMessage) => React.ReactNode;
    isLoadingMore: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const MessagesContainer: React.FC<MessagesContainerProps> = (
    {
        messages,
        room,
        renderDateLabel,
        isLoadingMore,
        messagesEndRef,
        messagesContainerRef
    }) => {
    const {user} = useContext(AuthContext) as AuthContextType;

    const {theme} = useTheme();
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
                    boxShadow={theme.palette.shadows ? theme.palette.shadows.SO005 : ''}
                    style={{display: 'flex', flexDirection: 'column'}}
                >
                    {isLoadingMore && <CircularProgress/>}
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
                                color={theme.palette.text.primary30}>
                            Начните писать первым
                        </FCCC>
                    }
                    <div ref={messagesEndRef}></div>
                </FCE>
            ) : (
                <CircularProgress/>
            )}
        </FC>
    );
};

export default React.memo(MessagesContainer);
