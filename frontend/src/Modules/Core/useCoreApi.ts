import {useApi} from 'Api/useApi';

export const useCoreApi = () => {
    const {api} = useApi();
    return {
        setLang: (lang: string) => api.post('/api/v1/user/set-lang/', {lang}, undefined, true),
    };
};

export type UseCoreApi = ReturnType<typeof useCoreApi>;
