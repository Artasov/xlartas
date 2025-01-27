// User/UserAvatarEditable.tsx
import React, {ChangeEvent, useContext, useRef, useState} from 'react';
import UserAvatar from 'User/UserAvatar';
import {axios} from "Auth/axiosConfig";
import {Message} from "Core/components/Message";
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import {AuthContext, AuthContextType} from "Auth/AuthContext";

import './UserAvatarEditable.sass';
import {ErrorContextType, useErrorProcessing} from "Core/components/ErrorProvider";
import {useTheme} from "Theme/ThemeContext";
import {FC, FCCC} from "WideLayout/Layouts";
import CircularProgress from "Core/components/elements/CircularProgress";

interface UserAvatarEditableProps {
    size: string;
    sx?: object;
    className?: string;
}

const UserAvatarEditable: React.FC<UserAvatarEditableProps> = ({size, sx, className}) => {
    const {byResponse} = useErrorProcessing() as ErrorContextType;
    const {user, updateCurrentUser} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();
    const uploadIconRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                await axios.patch('/api/v1/user/update/avatar/', formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
                await updateCurrentUser();
                Message.success('Аватар успешно обновлен.');
            } catch (e) {
                byResponse(e);
                Message.error('Не удалось обновить аватар.');
            } finally {
                setIsLoading(false);
                uploadIconRef?.current?.blur();
            }
        }
    };

    return (
        <FC cls={`${className}`} w={'min-content'}>
            <input
                className={'d-none'}
                accept="image/*"
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload" className={'user-avatar-editable position-relative'}>
                {!isLoading && (
                    <UserAvatar
                        avatar={user?.avatar}
                        size={size}
                        sx={sx}
                        className={className}
                    />
                )}
                {isLoading && <CircularProgress size={size}/>}
                <FCCC
                    cls={`user-avatar-editable-overlay ftrans-200-eio ${isLoading ? 'visible' : ''}`}
                    color={theme.palette.text.contrast90}
                    bg={theme.palette.bg.contrast40}
                    w={size}
                    h={size}
                    pos={'absolute'}
                    top={0}
                    left={0}
                    rounded={6}
                    zIndex={10}
                    sx={{
                        pointerEvents: 'none',
                        opacity: isLoading ? '100%' : '0%',
                        backdropFilter: 'blur(5px)',
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    <FC
                        className={'user-avatar-editable-upload-icon ftrans-200-eio'}
                        sx={{
                            opacity: isLoading ? '100%' : '0%',
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        <UploadRoundedIcon style={{fontSize: `calc(${size} / 2)`}}/>
                    </FC>
                </FCCC>
            </label>
        </FC>
    );
};

export default UserAvatarEditable;
