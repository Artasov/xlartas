"use client";
import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useCompanyApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        getCompany: (name: string) => api.get(`/api/v1/companies/${encodeURIComponent(name)}/`),
        getDocument: (id: number | string) => api.get(`/api/v1/docs/${id}/`),
    }), [api]);
};

export type UseCompanyApi = ReturnType<typeof useCompanyApi>;
