// src/components/CloudPaymentButton.tsx
import React from 'react';
import {Message} from 'Core/components/Message';
import {IOrder} from 'types/commerce/shop';
import {useApi} from "../Api/useApi";
import {useCloudPayments} from "./useCloudPayments";
import Button from "Core/components/elements/Button/Button";

interface Props {
    order: IOrder;
    onSuccess?: (data: IOrder) => void;
}

export const CloudPaymentButton: React.FC<Props> = ({order, onSuccess}) => {
    const scriptReady = useCloudPayments();
    const {api} = useApi();

    const handlePay = () => {
        if (!scriptReady) {
            Message.info('Загружаем платежный виджет, чуть-чуть подождите…');
            return;
        }
        const cp = (window as any).cp;
        if (!cp || !cp.CloudPayments) {
            return Message.error('Не удалось загрузить CloudPayments.');
        }

        const widget = new cp.CloudPayments();
        widget.pay(
            'charge',
            {
                publicId: process.env.REACT_CLOUD_PAYMENTS_PUBLIC_ID,
                description: `Оплата заказа #${order.id}`,
                amount: order.payment.amount,   // теперь это уже число или строка с точкой
                currency: order.currency,
                invoiceId: order.id,
                accountId: String(order.user?.id ?? ''),
                email: order.user?.email ?? '',
                skin: 'mini',
                data: {order_id: order.id},
            },
            {
                onSuccess: async (options: any) => {
                    Message.success('Платёж прошёл успешно');
                    // обновляем заказ на бэке
                    await api.post(`/api/v1/orders/${order.id}/sync-with-payment/`);
                    onSuccess?.({...order, is_paid: true});
                },
                onFail: (reason: string) => {
                    Message.error(`Платёж не прошёл: ${reason}`);
                },
                onComplete: () => {
                    // сюда можно вставить аналитику
                }
            }
        );
    };

    return (
        <Button
            disabled={!order.is_inited || order.is_paid || order.is_cancelled}
            loading={!scriptReady}
            onClick={handlePay}
            style={{backgroundColor: '#1976d2', color: '#fff'}}
        >
            Оплатить
        </Button>
    );
};
