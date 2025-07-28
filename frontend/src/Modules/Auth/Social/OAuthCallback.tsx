// Modules/Auth/Social/OAuthCallback.tsx
import {OAUTH_PROVIDERS} from 'Auth/Social/constants';
import {useParams} from 'Utils/nextRouter';
import React, {useEffect} from "react";
import {useAuth} from "Auth/AuthContext";
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import pprint from 'Utils/pprint';

const OAuthCallback: React.FC = () => {
    const auth = useAuth();
    const {provider} = useParams<{ provider: string }>();
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    // Corrected part
    const stateParams = state ? new URL(state).searchParams : null;
    const realNext = stateParams ? stateParams.get('next') : null;

    useEffect(() => {
        pprint('OAuthCallback');
        pprint('window.location.search:', window.location.search);
        pprint('State:', state);
        pprint('stateParams:', stateParams);
        pprint('realNext:', realNext);
        if (code) {
            switch (provider) {
                case OAUTH_PROVIDERS.GOOGLE:
                    auth.google_oauth2(code, realNext).catch(console.error);
                    break;
                case OAUTH_PROVIDERS.DISCORD:
                    auth.discord_oauth2(code, realNext).catch(console.error);
                    break;
                case OAUTH_PROVIDERS.VK:
                    auth.vk_oauth2(code, realNext).catch(console.error);
                    break;
                case OAUTH_PROVIDERS.YANDEX:
                    auth.yandex_oauth2(code, realNext).catch(console.error);
                    break;
                default:
                    console.error('Unsupported provider');
            }
        }
    }, [provider, code]);

    return (
        <div className="h-70 frcc">
            <CircularProgressZoomify in size={'180px'}/>
        </div>
    );
};

export default OAuthCallback;
