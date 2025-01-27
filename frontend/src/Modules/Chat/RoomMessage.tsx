// Chat/RoomMessage.tsx

import React, {useCallback, useContext, useState} from 'react';
import UserAvatar from "User/UserAvatar";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {format, isValid, parseISO} from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {IMessage} from "types/chat/models";
import {useTheme} from "Theme/ThemeContext";
import Modal from 'Core/components/elements/Modal/Modal';
import {Box} from '@mui/material';
import {FC} from "WideLayout/Layouts";

interface RoomMessageProps {
    message: IMessage;
    room_capacity: number;
}

const RoomMessage: React.FC<RoomMessageProps> = ({message, room_capacity}) => {
    const {user} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const messageDate = parseISO(message.created_at);
    const formattedDate = isValid(messageDate) ? format(messageDate, 'HH:mm') : '';

    const getStatusIcon = useCallback(() => {
        if (message.status === 'sending') {
            return <AccessTimeIcon className={'fs-6 pb-1px'}/>;
        } else if (message.is_read) {
            return <DoneAllIcon className={'fs-6 pb-1px'}/>;
        } else {
            return <DoneIcon className={'fs-6 pb-1px'}/>;
        }
    }, [message.status, message.is_read]);

    const handleImageClick = useCallback((imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedImage(null);
    }, []);

    return (
        <>
            <div
                className={`room-message maxw-60 position-relative fr gap-2 rounded-3 px-2 pt-2 pb-1   
                    ${user?.id === message.user.id ? 'align-self-end' : 'align-self-start'}
                `}
                style={{
                    backgroundColor: user?.id === message.user.id ? 'rgba(0,88,255,0.1)' : 'rgba(34,0,255,0.1)'
                }}
            >
                {message.is_important && <FC
                    pos={'absolute'} left={0} top={0} bg={theme.colors.error.light}
                    rounded={6} w={10} h={10}></FC>}
                {room_capacity !== 2 && <UserAvatar avatar={message.user.avatar} size={'3rem'}/>}
                <div className={'fc '}>
                    {room_capacity !== 2 && <span>{message.user.first_name} {message.user.last_name}</span>}
                    <div className={`${message.text.length < 30 ? 'frsc' : 'fc'} flex-wrap`}>
                        <span
                            style={{
                                textOverflow: 'ellipsis',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                paddingBottom: message.text.length < 30 ? '3px' : '',
                            }}
                        >
                            {message.text}
                        </span>
                        <div
                            className={`w-min frcc gap-2 ps-3 fs-7 align-self-end`}
                            style={{color: theme.palette.text.primary40}}
                        >
                            {formattedDate}
                            {user?.id === message.user.id && getStatusIcon()}
                        </div>
                    </div>
                    <div>
                        {message.files.map((file: any) => {
                            const isImage = file.type.startsWith('image/');
                            return (
                                <div key={file.id} style={{marginTop: '5px'}}>
                                    {isImage ? (
                                        <img
                                            src={file.file}
                                            alt={file.name}
                                            style={{maxWidth: '200px', cursor: 'pointer', borderRadius: '5px'}}
                                            onClick={() => handleImageClick(file.file)}
                                        />
                                    ) : (
                                        <a href={file.file} target="_blank" rel="noopener noreferrer">
                                            {file.name}
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal for image preview */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title=""
                closeBtn={true}
                closeOnOutsideClick={true}
            >
                <Box display="flex" justifyContent="center" alignItems="center">
                    <img
                        src={selectedImage ? selectedImage : ''}
                        alt="Preview"
                        style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px'}}
                    />
                </Box>
            </Modal>

        </>
    );
};

export default React.memo(RoomMessage, (prevProps, nextProps) => {
    return (
        prevProps.message.id === nextProps.message.id &&
        prevProps.message.text === nextProps.message.text &&
        prevProps.message.is_read === nextProps.message.is_read &&
        prevProps.message.status === nextProps.message.status &&
        prevProps.message.files.length === nextProps.message.files.length &&
        prevProps.room_capacity === nextProps.room_capacity
    );
});
