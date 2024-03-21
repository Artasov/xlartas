import React, {useEffect} from 'react';
import {useAuth} from '../useAuth';

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
        <div>Loading...</div>
    )
}
export default DiscordOAuth;