import React from 'react';
import { useAuth } from '../useAuth';
import { useEffect } from 'react';

const DiscordOAuth = () => {

    const auth = useAuth()

    useEffect(() => {
        if (window.location.search && !window.localStorage.getItem("access")) {
            let urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("code")) {
                auth.discord_oauth2(urlParams.get("code"))
            }
        }    
    })

    return (
        <div>Loading...</div>
    )

}


export default DiscordOAuth;