import React, {useEffect, useRef} from 'react';
import {IconButton} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const SocialLogin = ({className}) => {
    const socialDiv = useRef();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?19";
        script.setAttribute("data-telegram-login", "xlartas_web_bot");
        script.setAttribute("data-size", "large");
        script.setAttribute("data-radius", "8");
        script.setAttribute("data-userpic", "false");
        script.setAttribute("data-auth-url", "https://xlartas.ru/accounts/telegram/login/callback/");
        script.setAttribute("data-request-access", "write");
        socialDiv.current.appendChild(script);
    }, []);

    const handleGoogle = () => {
        const loginWindow = window.open(
            `/google/`,
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
        <div ref={socialDiv} className={`${className} frcc mt-3 gap-2`}>
            <IconButton onClick={() => handleGoogle()}>
                <GoogleIcon fontSize={'large'}/>
            </IconButton>
            {/*<IconButton>*/}
            {/*    <TelegramIcon fontSize={'large'}/>*/}
            {/*</IconButton>*/}
        </div>
    );
};

export default SocialLogin;
