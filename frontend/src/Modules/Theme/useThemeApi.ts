import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useThemeApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        getThemes: () => api.get('/api/v1/themes/'),
    }), [api]);
};

export type UseThemeApi = ReturnType<typeof useThemeApi>;
