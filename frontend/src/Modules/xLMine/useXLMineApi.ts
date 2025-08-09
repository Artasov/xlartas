import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useXLMineApi = () => {
    const {api} = useApi();

    return useMemo(() => ({
        // Launcher endpoints
        getLaunchers: () => api.get('/api/v1/xlmine/launcher/'),
        createLauncher: (formData: FormData) =>
            api.post('/api/v1/xlmine/launcher/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
        deleteLauncher: (id: number) => api.delete(`/api/v1/xlmine/launcher/${id}/`),
        getLatestLauncher: () => api.get('/api/v1/xlmine/launcher/latest/'),

        // Release endpoints
        getReleases: () => api.get('/api/v1/xlmine/release/'),
        uploadReleaseChunk: (formData: FormData) =>
            api.post('/api/v1/xlmine/chunked-release/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
        deleteRelease: (id: number) => api.delete(`/api/v1/xlmine/release/${id}/`),

        // Skin & Cape
        getCurrentSkinCape: () => api.get('/api/v1/xlmine/current/skin-cape/'),
        uploadSkin: (formData: FormData) =>
            api.post('/api/v1/xlmine/skin/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
        uploadCape: (formData: FormData) =>
            api.post('/api/v1/xlmine/cape/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),

        // Privileges
        getPrivileges: () => api.get('/api/v1/xlmine/privilege/'),
        getCurrentPrivilege: () => api.get('/api/v1/xlmine/privilege/current/'),

        // Donate
        getLatestDonateProduct: () => api.get('/api/v1/xlmine/donate/product/latest/'),
        createOrder: (payload: unknown) => api.post('/api/v1/orders/create/', payload),
    }), [api]);
};

export type UseXLMineApi = ReturnType<typeof useXLMineApi>;
