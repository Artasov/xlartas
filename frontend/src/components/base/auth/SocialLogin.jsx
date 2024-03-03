import React from 'react';
import {IconButton} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import TelegramIcon from '@mui/icons-material/Telegram';

const SocialLogin = ({className}) => {
    const handleSocialLogin = (provider) => {
        const loginWindow = window.open(
            `/accounts/${provider}/login/`,
            'SocialLogin',
            'width=600,height=700'
        );

        // Опционально: ожидание закрытия окна и выполнение действий после входа
        const timer = setInterval(() => {
            if (loginWindow.closed) {
                clearInterval(timer);
                // Обновление состояния после входа, если требуется
            }
        }, 500);
    };

    return (
        <div className={`${className} frcc mt-3 gap-2`}>
            <IconButton onClick={() => handleSocialLogin('google')}>
                <GoogleIcon fontSize={'large'}/>
            </IconButton>
            <IconButton onClick={() => handleSocialLogin('telegram')}>
                <TelegramIcon fontSize={'large'}/>
            </IconButton>
        </div>
    );
};

export default SocialLogin;
