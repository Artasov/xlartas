import React, {ChangeEvent, useContext, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import UserAvatar from 'User/UserAvatar';
import {Message} from 'Core/components/Message';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';

import './UserAvatarEditable.sass';
import {useTheme} from 'Theme/ThemeContext';
import {FC, FCCC} from 'wide-containers';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {useApi} from 'Api/useApi';

interface UserAvatarEditableProps {
    size: string;
    sx?: object;
    className?: string;
}

const UserAvatarEditable: React.FC<UserAvatarEditableProps> = ({size, sx, className}) => {
    const {user, updateCurrentUser} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();
    const {t} = useTranslation();
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
            }).then(() => {
                updateCurrentUser().then(() => Message.success(t('avatar_update_success')));
            }).catch(() => Message.error(t('avatar_update_error')))
                .finally(() => {
                    setIsLoading(false);
                    uploadIconRef?.current?.blur();
                });
        }
    };

    return (
        <FC cls={className ?? ''} w={'min-content'}>
            <input
                className={'d-none'} accept="image/*" id="avatar-upload"
                type="file" onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload" className="user-avatar-editable position-relative">
                {isLoading
                    ? <CircularProgressZoomify in size={size}/>
                    : <UserAvatar avatar={user?.avatar} size={size} sx={sx} className={className}/>
                }
                <FCCC
                    cls="user-avatar-editable-overlay ftrans-200-eio"
                    bg={`${plt.text.primary}17`} rounded={6} w={size} h={size}
                    pos="absolute" top={0} left={0} zIndex={10}
                    pEvents={false} opacity={isLoading ? 0 : 37}
                    sx={{
                        backdropFilter: 'blur(5px)',
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    <FC ref={uploadIconRef} opacity={isLoading ? 0 : 37}
                        className="user-avatar-editable-upload-icon ftrans-200-eio"
                        sx={{transition: 'opacity 0.3s ease',}}
                    >
                        <UploadRoundedIcon style={{fontSize: `calc(${size} / 1.6)`}}/>
                    </FC>
                </FCCC>
            </label>
        </FC>
    );
};

export default UserAvatarEditable;
