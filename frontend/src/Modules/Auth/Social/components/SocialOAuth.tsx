// Modules/Auth/Social/components/SocialOAuth.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button as MuiButton, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar} from '@mui/material';
import MuiAlert, {AlertProps} from '@mui/material/Alert';
import {faGoogle, faYandex} from '@fortawesome/free-brands-svg-icons';
import {axios, GOOGLE_CLIENT_ID, YANDEX_CLIENT_ID} from '../../../Api/axiosConfig';
import OAuthButton from "Auth/Social/elements/OAuthButton";
import {ProviderConfig} from "Auth/Social/types";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import TermsCheckboxes from "Core/components/TermsCheckboxes";
import {useTheme} from "Theme/ThemeContext";
import {Button} from "@mui/material";
import {FR} from "wide-containers";

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
    const [pendingOAuthUrl, setPendingOAuthUrl] = useState<string | null>(null);
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [modalFirstChecked, setModalFirstChecked] = useState<boolean>(false);
    const [modalSecondChecked, setModalSecondChecked] = useState<boolean>(false);
    const {plt} = useTheme();
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
    }, [isAuthenticated]);

    const providers: ProviderConfig[] = [
        {
            provider: 'google',
            icon: faGoogle,
            clientId: GOOGLE_CLIENT_ID,
            redirectUri: 'https://accounts.google.com/o/oauth2/v2/auth',
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        },
        {
            provider: 'yandex',
            icon: faYandex,
            clientId: YANDEX_CLIENT_ID,
            redirectUri: 'https://oauth.yandex.ru/authorize',
            scope: 'login:email login:info',
        },
    ];

    const handleOAuthClick = (oauthUrl: string) => {
        if (localStorage.getItem('social_terms_accepted') === 'true') {
            window.location.href = oauthUrl;
        } else {
            setPendingOAuthUrl(oauthUrl);
            setShowTermsModal(true);
        }
    };

    const handleModalConfirm = () => {
        if (modalFirstChecked) {
            localStorage.setItem('social_terms_accepted', 'true');
            setShowTermsModal(false);
            if (pendingOAuthUrl) {
                window.location.href = pendingOAuthUrl;
            }
        }
    };

    const handleModalCancel = () => {
        setShowTermsModal(false);
        setPendingOAuthUrl(null);
    };

    return (
        <FR g={.2} ref={socialDiv} cls={`${className}`}>
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
                    onClick={handleOAuthClick}
                />
            ))}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{width: '100%'}}>
                    Login process was interrupted. Please try again.
                </Alert>
            </Snackbar>
            <Dialog open={showTermsModal} onClose={handleModalCancel}>
                <DialogTitle>Подтвердите условия</DialogTitle>
                <DialogContent>
                    <TermsCheckboxes
                        firstChecked={modalFirstChecked}
                        secondChecked={modalSecondChecked}
                        onFirstCheckedChange={(checked) => {
                            setModalFirstChecked(checked);
                            setModalSecondChecked(checked);
                        }}
                        onSecondCheckedChange={setModalSecondChecked}
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleModalCancel}>Отмена</MuiButton>
                    <Button onClick={handleModalConfirm} disabled={!modalFirstChecked} variant="contained"
                            color="primary">
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>
        </FR>
    );
};

export default SocialOAuth;
