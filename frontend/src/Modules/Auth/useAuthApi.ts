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
            api.post<{access: string; refresh?: string}>('/api/v1/token/refresh/', {refresh}),
        getSocialAccounts: () => api.get<Record<string, boolean>>('/api/v1/oauth/user/social-accounts/'),
    };
};

export type UseAuthApi = ReturnType<typeof useAuthApi>;
