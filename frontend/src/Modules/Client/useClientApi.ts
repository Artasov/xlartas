import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useClientApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        updateClient: (formData: FormData) =>
            api.patch('/api/v1/client/update/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            }),
    }), [api]);
};

export type UseClientApi = ReturnType<typeof useClientApi>;
