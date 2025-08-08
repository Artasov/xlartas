"use client";
import {useApi} from 'Api/useApi';
import {JWTPair} from 'types/core/auth';
import {IUser} from 'types/core/user';

export const useAuthApi = () => {
    const {api} = useApi();

    return {
        login: (username: string, password: string) =>
            api.post<JWTPair>('/api/v1/token/', {username, password}),
        logout: () => api.post('/api/v1/logout/'),
        getCurrentUser: () => api.get<IUser>('/api/v1/current_user/'),
        oauthCallback: (provider: string, code: string) =>
            api.get(`/api/v1/oauth/${provider}/callback/`, {params: {code}}),
        refreshToken: (refresh: string) =>
            api.post<{ access: string; refresh?: string }>('/api/v1/token/refresh/', {refresh}),
        getSocialAccounts: () => api.get<Record<string, boolean>>('/api/v1/oauth/user/social-accounts/'),
        checkPhoneExists: (phone: string) => api.post('/api/v1/check-phone-exists/', {phone}),
        checkEmailExists: (email: string) => api.post('/api/v1/check-email-exists/', {email}),
        signup: (payload: unknown) => api.post('/api/v1/signup/', payload),
        getAuthMethods: (credential: string) => api.post('/api/v1/user/auth_methods/', {credential}),
    };
};

export type UseAuthApi = ReturnType<typeof useAuthApi>;
