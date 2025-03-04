// Modules/Order/OrderActions.tsx
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {MenuItem} from "@mui/material";
import OptionsMenu from "Core/components/elements/OptionsMenu";
import Button from "Core/components/elements/Button/Button";
import {useTheme} from "Theme/ThemeContext";
import {Message} from "Core/components/Message";
import pprint from 'Utils/pprint';
import {IOrder} from "types/commerce/shop";
import {useApi} from "../Api/useApi";

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
    const {user} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();
    const {api} = useApi()
    // Action Handlers
    const handleCancelOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/cancel/`).then(data => {
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent('Order canceled successfully.')}`);
        }).catch(_=>null).finally(() => setLoading(false));
    };

    const handleExecuteOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/execute/`).then(data => {
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent('Order executed successfully.')}`);
        }).catch(_=>null).finally(() => setLoading(false));
    };

    const handleResendNotificationOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/resend_payment_notification/`).then(data => {
            pprint(`Order ID: ${order.id} notification resent`, data);
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent('Order notification resent successfully.')}`);
        }).catch(_=>null).finally(() => setLoading(false));
    };

    const handleRedirectToPayment = () => {
        if (order.payment) window.location.href = order.payment.payment_url;
        else Message.error('No link for payment was found');
    };

    const handleRedirectToRefund = () => navigate(`/refund/${order.id}`);

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
                label: 'Execute',
                onClick: handleExecuteOrder,
                style: {backgroundColor: plt.bg.contrast10},
            });
            actions.push({
                label: 'Notification',
                onClick: handleResendNotificationOrder,
                style: {backgroundColor: plt.bg.contrast10},
            });
        }

        // Добавляем действие для запроса возврата, если заказ не инициализирован, не отменен и не возвращен
        if (!order.is_inited && !order.is_cancelled && !order.is_refunded) {
            actions.push({
                label: 'Request a refund',
                onClick: handleRedirectToRefund,
                style: {backgroundColor: plt.bg.contrast10},
            });
        }

        // Добавляем действие для отмены заказа, если заказ инициализирован, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            actions.push({
                label: 'Cancel',
                onClick: handleCancelOrder,
                style: {backgroundColor: plt.bg.contrast10},
            });
        }

        // Добавляем действие "Оплатить", если заказ инициализирован, не оплачен, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_paid && !order.is_cancelled && !order.is_executed && !order.is_refunded && order.payment.payment_url) {
            actions.push({
                label: 'Pay',
                onClick: handleRedirectToPayment,
                style: {backgroundColor: plt.info.main},
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
                                className="h-min px-2 pt-6px"
                                style={{color: plt.text.primary70, ...action.style}}
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
