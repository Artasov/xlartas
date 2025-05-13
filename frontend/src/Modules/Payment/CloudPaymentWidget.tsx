// src/Modules/Order/CloudPaymentWidget.tsx
import React, {useEffect} from 'react';
import {Message} from 'Core/components/Message';
import {useApi} from '../Api/useApi';
import {IOrder} from 'types/commerce/shop';
import {useCloudPayments} from "./useCloudPayments";

interface Props {
    /** показать/скрыть виджет */
    open: boolean;
    /** заказ, который сейчас платим */
    order: IOrder;
    /** закрыть виджет + перерисовать родителя */
    onClose: (needRefresh?: boolean) => void;
}

const publicId = process.env.REACT_CLOUD_PAYMENTS_PUBLIC_ID as string;

const CloudPaymentWidget: React.FC<Props> = ({open, order, onClose}) => {
    const scriptReady = useCloudPayments();
    const {api} = useApi();

    useEffect(() => {
        if (!open || !scriptReady) return;

        // проинициализируем виджет
        // @ts-ignore
        const widget = new window.cp.CloudPayments();

        widget.pay(
            'charge',                                  // одностадийная схема
            {
                publicId,
                description: `Оплата заказа #${order.id}`,
                amount: order.payment.amount,
                currency: order.currency,
                invoiceId: order.id,
                accountId: String(order.user?.id ?? ''), // если есть
                email: order.user?.email,
                skin: 'mini',
                data: {order_id: order.id}               // прилетит в webhook
            },
            {
                onSuccess: async () => {                 // успешный платёж
                    try {                                  // синхронизируем заказ
                        await api.post(`/api/v1/orders/${order.id}/sync-with-payment/`);
                    } finally {
                        onClose(true);                       // попросим обновить UI
                    }
                },
                onFail: () => {
                    Message.error('Платёж не прошёл');
                    onClose();
                },
                onComplete: () => {/* analytics */
                }
            }
        );
    }, [open, scriptReady, order, api, onClose]);

    return null;         // Компонент не рендерит разметку – виджет сам всё делает
};

export default CloudPaymentWidget;
