// Auth/Social/components/SocialOAuth.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Snackbar} from '@mui/material';
import MuiAlert, {AlertProps} from '@mui/material/Alert';
import {faGoogle, faYandex} from '@fortawesome/free-brands-svg-icons';
import {axios, GOOGLE_CLIENT_ID, YANDEX_CLIENT_ID} from 'Auth/axiosConfig';
import OAuthButton from "Auth/Social/elements/OAuthButton";
import {ProviderConfig} from "Auth/Social/types";
import {AuthContext, AuthContextType} from "Auth/AuthContext";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface SocialOAuthProps {
    className?: string;
}

const SocialOAuth: React.FC<SocialOAuthProps> = ({className}) => {
    const socialDiv = useRef<HTMLDivElement | null>(null);
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [socialAccounts, setSocialAccounts] = useState<{ [key: string]: boolean }>({});

    const handleCloseSnackbar = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    useEffect(() => {
        if (isAuthenticated)
            axios.get('/api/v1/oauth/user/social-accounts/')
                .then(response => {
                    setSocialAccounts(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
    }, []);

    const providers: ProviderConfig[] = [
        {
            provider: 'google',
            icon: faGoogle,
            clientId: GOOGLE_CLIENT_ID,
            redirectUri: 'https://accounts.google.com/o/oauth2/v2/auth',
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        },
        // {
        //     provider: 'vk',
        //     icon: faVk,
        //     clientId: VK_AUTH_CLIENT_ID,
        //     redirectUri: 'https://oauth.vk.com/authorize',
        //     scope: 'email',
        // },
        {
            provider: 'yandex',
            icon: faYandex,
            clientId: YANDEX_CLIENT_ID,
            redirectUri: 'https://oauth.yandex.ru/authorize',
            scope: 'login:email login:info',
        },
        // {
        //     provider: 'discord',
        //     icon: faDiscord,
        //     clientId: DISCORD_CLIENT_ID,
        //     redirectUri: 'https://discord.com/api/oauth2/authorize',
        //     scope: 'identify email',
        // },
    ];


    return (
        <div ref={socialDiv} className={`${className} fr gap-2`}>
            {providers.map(({provider, icon, clientId, redirectUri, scope}) => (
                <OAuthButton
                    key={provider}
                    provider={provider}
                    icon={icon}
                    clientId={clientId}
                    redirectUri={redirectUri}
                    scope={scope}
                    pxIconSize={50}
                    linked={socialAccounts[provider]}
                />
            ))}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{width: '100%'}}>
                    Login process was interrupted. Please try again.
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SocialOAuth;
