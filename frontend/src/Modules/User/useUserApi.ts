import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useUserApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        updateAvatar: (formData: FormData) =>
            api.patch('/api/v1/user/update/avatar/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
        updateInfo: (payload: unknown) => api.patch('/api/v1/user/update/', payload),
    }), [api]);
};

export type UseUserApi = ReturnType<typeof useUserApi>;
