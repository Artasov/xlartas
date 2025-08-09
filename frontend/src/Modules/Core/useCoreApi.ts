import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useCoreApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        setLang: (lang: string) => api.post('/api/v1/user/set-lang/', {lang}, undefined, true),
        getBackendConfig: () => api.get('/api/v1/backend/config/'),
    }), [api]);
};

export type UseCoreApi = ReturnType<typeof useCoreApi>;
