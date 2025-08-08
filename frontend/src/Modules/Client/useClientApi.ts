import {useApi} from 'Api/useApi';

export const useClientApi = () => {
    const {api} = useApi();
    return {
        updateClient: (formData: FormData) =>
            api.patch('/api/v1/client/update/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
    };
};

export type UseClientApi = ReturnType<typeof useClientApi>;
