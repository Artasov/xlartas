import React, {useEffect} from 'react';
import {useAuth} from '../useAuth';
import {CircularProgress} from "@mui/material";


const GoogleOAuth = () => {
    const auth = useAuth()
    useEffect(() => {
        if (window.location.search && !window.localStorage.getItem('access')) {
            const codeUrlParamValue = (new URLSearchParams(window.location.search)).get('code');
            if (codeUrlParamValue) auth.google_oauth2(codeUrlParamValue);
        }
    })
    return (
        <div className={'h-70 frcc'}>
            <CircularProgress style={{width: 180, height: 180}}/>
        </div>
    )
}
export default GoogleOAuth;