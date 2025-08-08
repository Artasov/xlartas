import {useApi} from 'Api/useApi';

export const useOrderApi = () => {
    const {api} = useApi();
    return {
        getUserBalance: () => api.get('/api/v1/user/balance/'),
        getLatestBalanceProduct: () => api.get('/api/v1/balance/product/latest/'),
        createOrder: (payload: unknown) => api.post('/api/v1/orders/create/', payload),
        applyPromocode: (payload: unknown) => api.post('/api/v1/promocode/applicable/', payload),
        getPaymentTypes: () => api.get('/api/v1/payment/types/'),
        getUserOrders: () => api.get('/api/v1/user/orders/'),
        initPayment: (orderId: string | number, payload: unknown) =>
            api.post(`/api/v1/orders/${orderId}/init-payment/`, payload),
        getOrder: (id: number | string) => api.get(`/api/v1/orders/${id}/`),
        cancelOrder: (id: number | string) => api.post(`/api/v1/orders/${id}/cancel/`),
        executeOrder: (id: number | string) => api.post(`/api/v1/orders/${id}/execute/`),
        deleteOrder: (id: number | string) => api.post(`/api/v1/orders/${id}/delete/`),
        resendPaymentNotification: (id: number | string) =>
            api.post(`/api/v1/orders/${id}/resend_payment_notification/`),
    };
};

export type UseOrderApi = ReturnType<typeof useOrderApi>;
