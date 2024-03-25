import React, {useRef, useState} from 'react';
import {IconButton, Snackbar} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiscord, faGoogle} from "@fortawesome/free-brands-svg-icons";
import {DISCORD_CLIENT_ID, DOMAIN_URL_ENCODED, GOOGLE_CLIENT_ID} from "../../../services/base/axiosConfig";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SocialLogin = ({className, iconsClassName, pxIconSize = 50}) => {
    const socialDiv = useRef();
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const googleOAuth2Url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${DOMAIN_URL_ENCODED}%2Fgoogle-callback%2F&prompt=consent&response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20openid&access_type=offline`
    const discordOAuth2Url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${DOMAIN_URL_ENCODED}%2Fdiscord-callback%2F&scope=identify+email`

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    return (
        <div ref={socialDiv} className={`${className ? className : 'frcc'} mt-3 gap-2`}>
            <a href={googleOAuth2Url}>
                <IconButton className={'ratio-1-1'} style={{height: `${pxIconSize}px`}}>
                    <FontAwesomeIcon icon={faGoogle} className={`${iconsClassName} hover-scale-5 h-100`}/>
                </IconButton>
            </a>
            <a href={discordOAuth2Url}>
                <IconButton className={'ratio-1-1 '} style={{height: `${pxIconSize}px`}}>
                    <FontAwesomeIcon icon={faDiscord} className={`${iconsClassName} h-100 ratio-1-1`} style={{transform: 'scale(1.2)'}}/>
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
