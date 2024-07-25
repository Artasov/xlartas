import React, {useEffect} from 'react';
import {useAuth} from '../useAuth';
import {CircularProgress} from "@mui/material";

const DiscordOAuth = () => {
    const auth = useAuth()
    useEffect(() => {
        if (window.location.search) {
            const codeUrlParamValue = (new URLSearchParams(window.location.search)).get('code');
            if (codeUrlParamValue) {
                auth.discord_oauth2(codeUrlParamValue);
            }
        }
    })
    return (
        <div className={'h-70 frcc'}>
            <CircularProgress style={{width: 180, height: 180}}/>
        </div>
    )
}
export default DiscordOAuth;