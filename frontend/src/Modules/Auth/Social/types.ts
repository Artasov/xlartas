// Auth/Social/types.ts
// apps/SocialOAuth/types.ts
import {OAUTH_PROVIDERS} from "Auth/Social/constants";

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS];

export interface ProviderConfig {
    provider: OAuthProvider;
    icon: any;
    clientId: string;
    redirectUri: string;
    scope: string;
}
