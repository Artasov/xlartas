// Modules/User/UserAvatarEditable.tsx
import React, {ChangeEvent, useContext, useRef, useState} from 'react';
import UserAvatar from 'User/UserAvatar';
import {Message} from "Core/components/Message";
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import {AuthContext, AuthContextType} from "Auth/AuthContext";

import './UserAvatarEditable.sass';
import {useTheme} from "Theme/ThemeContext";
import {FC, FCCC} from "wide-containers";
import CircularProgress from "Core/components/elements/CircularProgress";
import {useApi} from "../Api/useApi";

interface UserAvatarEditableProps {
    size: string;
    sx?: object;
    className?: string;
}

const UserAvatarEditable: React.FC<UserAvatarEditableProps> = ({size, sx, className}) => {
    const {user, updateCurrentUser} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();
    const uploadIconRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {api} = useApi();

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            api.patch('/api/v1/user/update/avatar/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }).then(_ => {
                updateCurrentUser().then(() => Message.success('Аватар успешно обновлен.'));
            }).catch(_ =>
                Message.error('Не удалось обновить аватар.')
            ).finally(() => {
                setIsLoading(false);
                uploadIconRef?.current?.blur();
            })
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
                    color={plt.text.contrast90}
                    bg={plt.bg.contrast40}
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
