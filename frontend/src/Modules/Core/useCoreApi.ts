import {useApi} from 'Api/useApi';

export const useCoreApi = () => {
    const {api} = useApi();
    return {
        setLang: (lang: string) => api.post('/api/v1/user/set-lang/', {lang}, undefined, true),
        getBackendConfig: () => api.get('/api/v1/backend/config/'),
    };
};

export type UseCoreApi = ReturnType<typeof useCoreApi>;
