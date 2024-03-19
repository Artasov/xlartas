import React, {useRef, useState} from 'react';
import {IconButton, Snackbar} from '@mui/material';
import {useGoogleLogin} from '@react-oauth/google';
import {useAuth} from './useAuth';
import MuiAlert from '@mui/material/Alert';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiscord, faGoogle} from "@fortawesome/free-brands-svg-icons";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SocialLogin = ({className}) => {
    const socialDiv = useRef();
    const [openSnackbar, setOpenSnackbar] = useState(false);

    let auth = useAuth();

    let googleLogin = useGoogleLogin({
        onSuccess: credentialResponse => {
            auth.google_oauth2(credentialResponse.code);
            console.log('Login success');
        },
        onNonOAuthError: (e) => {
            console.log(e);
            console.log('onNonOAuthError');
            setOpenSnackbar(true);
        },
        onError: () => {
            console.log('Login Failed');
            setOpenSnackbar(true);
        },
        flow: "auth-code"
    });

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <div ref={socialDiv} className={`${className} frcc mt-3 gap-2`}>
            <IconButton onClick={googleLogin}>
                <FontAwesomeIcon style={{fontSize: '1em'}} icon={faGoogle} className={'hover-scale-5'}/>
            </IconButton>
            <a className={''}
                href="https://discord.com/oauth2/authorize?client_id=1018434499341733888&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2F&scope=identify">
                <IconButton className={'ratio-1-1'}>
                    <FontAwesomeIcon style={{fontSize: '1em'}} icon={faDiscord} className={'hover-scale-5'}/>
                </IconButton>
            </a>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{width: '100%'}}>
                    Login process was interrupted. Please try again.
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SocialLogin;
