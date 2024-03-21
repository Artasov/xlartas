import React, {useEffect} from 'react';
import {useAuth} from '../useAuth';


const GoogleOAuth = () => {
    const auth = useAuth()
    useEffect(() => {
        if (window.location.search && !window.localStorage.getItem('access')) {
            const codeUrlParamValue = (new URLSearchParams(window.location.search)).get('code');
            if (codeUrlParamValue) auth.google_oauth2(codeUrlParamValue);
        }
    })
    return (
        <div>Loading...</div>
    )
}
export default GoogleOAuth;