import {useApi} from 'Api/useApi';

export const useThemeApi = () => {
    const {api} = useApi();
    return {
        getThemes: () => api.get('/api/v1/themes/'),
    };
};

export type UseThemeApi = ReturnType<typeof useThemeApi>;
