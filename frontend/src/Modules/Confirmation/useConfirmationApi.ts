"use client";
import {useApi} from 'Api/useApi';
import {useMemo} from 'react';

export const useConfirmationApi = () => {
    const {api} = useApi();
    return useMemo(() => ({
        confirmCode: (payload: unknown) => api.post('/api/v1/confirmation-code/confirm/', payload),
        sendCode: (payload: unknown, isResend: boolean) =>
            api.post(isResend ? '/api/v1/confirmation-code/resend/' : '/api/v1/confirmation-code/new/', payload),
    }), [api]);
};

export type UseConfirmationApi = ReturnType<typeof useConfirmationApi>;
