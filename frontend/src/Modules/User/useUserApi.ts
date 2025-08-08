import {useApi} from 'Api/useApi';

export const useUserApi = () => {
    const {api} = useApi();
    return {
        updateAvatar: (formData: FormData) =>
            api.patch('/api/v1/user/update/avatar/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
        updateInfo: (payload: unknown) => api.patch('/api/v1/user/update/', payload),
    };
};

export type UseUserApi = ReturnType<typeof useUserApi>;
