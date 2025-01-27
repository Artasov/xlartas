// Order/OrderActions.tsx
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {axios} from "Auth/axiosConfig";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {MenuItem} from "@mui/material";
import OptionsMenu from "Core/components/elements/OptionsMenu";
import Button from "Core/components/elements/Button/Button";
import {useTheme} from "Theme/ThemeContext";
import {Message} from "Core/components/Message";
import pprint from 'Utils/pprint';
import {IOrder} from "types/commerce/shop";

interface OrderActionsProps {
    order: IOrder;
    extended?: boolean;
    onSomeUpdatingOrderAction: (updatedOrder: IOrder) => void;
    setLoading: (loading: boolean) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
                                                       order,
                                                       extended = false,
                                                       onSomeUpdatingOrderAction,
                                                       setLoading
                                                   }) => {
    const navigate = useNavigate();
    const {byResponse} = useErrorProcessing();
    const {user} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();

    // Action Handlers
    const handleCancelOrder = () => {
        setLoading(true);
        axios.post(`/api/v1/orders/${order.id}/cancel/`)
            .then((response) => {
                pprint(`Order ID: ${order.id} Cancelled`, response.data);
                onSomeUpdatingOrderAction(response.data);
                navigate(`?success_message=${encodeURIComponent('Order canceled successfully.')}`);
            })
            .catch(error => byResponse(error))
            .finally(() => setLoading(false));
    };

    const handleExecuteOrder = () => {
        setLoading(true);
        axios.post(`/api/v1/orders/${order.id}/execute/`)
            .then((response) => {
                pprint(`Order ID: ${order.id} Executed`, response.data);
                onSomeUpdatingOrderAction(response.data);
                navigate(`?success_message=${encodeURIComponent('Order executed successfully.')}`);
            })
            .catch(error => byResponse(error))
            .finally(() => setLoading(false));
    };

    const handleResendNotificationOrder = () => {
        setLoading(true);
        axios.post(`/api/v1/orders/${order.id}/resend_payment_notification/`)
            .then((response) => {
                pprint(`Order ID: ${order.id} notification resent`, response.data);
                onSomeUpdatingOrderAction(response.data);
                navigate(`?success_message=${encodeURIComponent('Order notification resent successfully.')}`);
            })
            .catch(error => byResponse(error))
            .finally(() => setLoading(false));
    };

    const handleRedirectToPayment = () => {
        if (order.payment) {
            window.location.href = order.payment.payment_url;
        } else {
            Message.error('Ссылка для оплаты не найдена');
        }
    };

    const handleRedirectToRefund = () => {
        navigate(`/refund/${order.id}`);
    };

    const getActions = () => {
        const actions: Array<{
            label: string;
            onClick: () => void;
            style?: React.CSSProperties;
            disabled?: boolean;
        }> = [];

        // Добавляем действия только для staff и если заказ не отменен, не исполнен и не возвращен
        if (user?.is_staff && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            actions.push({
                label: 'Исполнить',
                onClick: handleExecuteOrder,
                style: {backgroundColor: theme.palette.bg.contrast10},
            });
            actions.push({
                label: 'Нотификация',
                onClick: handleResendNotificationOrder,
                style: {backgroundColor: theme.palette.bg.contrast10},
            });
        }

        // Добавляем действие для запроса возврата, если заказ не инициализирован, не отменен и не возвращен
        if (!order.is_inited && !order.is_cancelled && !order.is_refunded) {
            actions.push({
                label: 'Запросить возврат',
                onClick: handleRedirectToRefund,
                style: {backgroundColor: theme.palette.bg.contrast10},
            });
        }

        // Добавляем действие для отмены заказа, если заказ инициализирован, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            actions.push({
                label: 'Отменить',
                onClick: handleCancelOrder,
                style: {backgroundColor: theme.palette.bg.contrast10},
            });
        }

        // Добавляем действие "Оплатить", если заказ инициализирован, не оплачен, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_paid && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            actions.push({
                label: 'Оплатить',
                onClick: handleRedirectToPayment,
                style: {backgroundColor: theme.palette.info.main},
            });
        }

        return actions;
    };

    const actions = getActions();

    return (
        <div className={'frsc gap-2 flex-wrap'}>
            {extended ? (
                <>
                    {actions.map((action, index) =>
                        action.disabled
                            ? <span key={index}>{action.label}</span>
                            : <Button
                                key={index}
                                className="h-min px-2"
                                style={action.style}
                                onClick={action.onClick}
                                size="small">
                                {action.label}
                            </Button>
                    )}
                </>
            ) : (
                actions.length > 0 && (
                    <OptionsMenu iconClassName="p-1" className="ms-auto">
                        {actions.map((action, index) => (
                            <MenuItem
                                key={index}
                                onClick={action.onClick}
                                disabled={action.disabled}>
                                {action.label}
                            </MenuItem>
                        ))}
                    </OptionsMenu>
                )
            )}
        </div>
    );
};

export default OrderActions;
