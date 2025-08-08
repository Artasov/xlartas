import {useApi} from 'Api/useApi';
import {IFormat, IParameter, IConvertResult} from 'types/converter';

export const useConverterApi = () => {
    const {api} = useApi();
    return {
        listFormats: () => api.get<IFormat[]>('/api/v1/converter/formats/'),
        getRemaining: () => api.get<{ remaining: number }>('/api/v1/converter/remaining/'),
        listFormatVariants: (id: number) => api.get<IFormat[]>(`/api/v1/converter/formats/${id}/variants/`),
        listFormatParameters: (id: number) => api.get<IParameter[]>(`/api/v1/converter/formats/${id}/parameters/`),
        convert: (formData: FormData) => api.post<IConvertResult>('/api/v1/converter/convert/', formData),
        getDownloadLink: (id: number | string) => `/api/v1/converter/download/${id}/`,
    };
};

export type UseConverterApi = ReturnType<typeof useConverterApi>;
