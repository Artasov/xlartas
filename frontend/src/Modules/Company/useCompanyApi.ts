import {useApi} from 'Api/useApi';

export const useCompanyApi = () => {
    const {api} = useApi();
    return {
        getCompany: (name: string) => api.get(`/api/v1/companies/${encodeURIComponent(name)}/`),
        getDocument: (id: number | string) => api.get(`/api/v1/docs/${id}/`),
    };
};

export type UseCompanyApi = ReturnType<typeof useCompanyApi>;
