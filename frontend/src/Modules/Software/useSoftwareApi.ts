import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useSoftwareApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        listLicenses: () => api.get('/api/v1/software/licenses/'),
        listSoftware: () => api.get('/api/v1/software/'),
        getSoftware: (id: number | string) => api.get(`/api/v1/software/${id}/`),
        getLicense: (softwareId: number | string) => api.get(`/api/v1/license/${softwareId}/`),
        activateTestPeriod: (softwareId: number | string) => api.post(`/api/v1/software/${softwareId}/activate-test-period/`),
        listWirelessMacros: () => api.get('/api/v1/wireless-macros/'),
        deleteWirelessMacro: (id: number | string) => api.delete(`/api/v1/wireless-macros/${id}/`),
        updateWirelessMacro: (id: number | string, payload: unknown) => api.put(`/api/v1/wireless-macros/${id}/`, payload),
        createWirelessMacro: (payload: unknown) => api.post('/api/v1/wireless-macros/', payload),
    }), [api]);
};

export type UseSoftwareApi = ReturnType<typeof useSoftwareApi>;
