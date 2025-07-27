// Modules/Order/OrderStatus.tsx
import React from 'react';
import {IOrder} from "types/commerce/shop";
import {FR} from "wide-containers";
import StatusItem from './OrderStatusItem';
import {useTheme} from "Theme/ThemeContext";
import {useTranslation} from 'react-i18next';

interface OrderStatusProps {
    order: IOrder;
}

const OrderStatus: React.FC<OrderStatusProps> = ({order}) => {
    const {theme} = useTheme();
    const {t} = useTranslation();

    const statusList = [
        {
            label: t('status_paid'),
            negativeLabel: t('status_not_paid'),
            isActive: order.is_paid,
            color: order.is_paid ? theme.colors.secondary.main : theme.colors.error.main,
            showNegative: true, // Показывать "Не оплачен"
        },
        {
            label: t('status_inited'),
            negativeLabel: t('status_not_inited'),
            isActive: order.is_inited,
            color: order.is_inited ? theme.colors.secondary.main : theme.colors.error.main,
            showNegative: true, // Показывать "Не инициализирован"
        },
        {
            label: t('status_executed'),
            negativeLabel: t('status_not_executed'),
            isActive: order.is_executed,
            color: order.is_executed ? theme.colors.secondary.main : theme.colors.error.main,
            showNegative: true, // Показывать "Не выполнен"
        },
        {
            label: 'Cancelled',
            isActive: order.is_cancelled,
            color: order.is_cancelled ? theme.colors.error.main : theme.colors.secondary.main,
            showNegative: false, // Не показывать "Не отменён"
        },
        {
            label: 'Refunded',
            isActive: order.is_refunded,
            color: order.is_refunded ? theme.colors.error.main : theme.colors.success.main,
            showNegative: false, // Не показывать "Не возвращен"
        },
    ];

    return (
        <FR g={'.5rem'} wrap>
            {statusList.map((status, index) => (
                <StatusItem
                    key={index}
                    label={status.label}
                    negativeLabel={status.negativeLabel}
                    isActive={status.isActive}
                    color={status.color}
                    showNegative={status.showNegative}
                />
            ))}
        </FR>
    );
};

export default OrderStatus;
