// Modules/Order/OrderActions.tsx
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useSearchParams} from 'Utils/nextRouter';
import {useAuth} from "Auth/AuthContext";
import {Button, MenuItem} from "@mui/material";
import OptionsMenu from "Core/components/elements/OptionsMenu";
import {useTheme} from "Theme/ThemeContext";
import {Message} from "Core/components/Message";
import pprint from 'Utils/pprint';
import {IOrder} from "types/commerce/shop";
import {useApi} from "Api/useApi";
import PaymentTypePickerModal from "Order/PaymentTypePickerModal";
import {FRSC} from "wide-containers";

interface OrderActionsProps {
    order: IOrder;
    extended?: boolean;
    onSomeUpdatingOrderAction: (updatedOrder: IOrder) => void;
    onOrderDeleted?: () => void;
    setLoading: (loading: boolean) => void;
}

const OrderActions: React.FC<OrderActionsProps> = (
    {
        order,
        extended = false,
        onSomeUpdatingOrderAction,
        onOrderDeleted,
        setLoading
    }) => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {theme, plt} = useTheme();
    const {api} = useApi()
    const {t} = useTranslation();
    const [payModal, setPayModal] = useState(false);
    const searchParams = useSearchParams();

    // если в URL есть `?pay=1`, открываем modal сразу
    React.useEffect(() => {
        if (searchParams.get('pay') === '1') {
            handlePay();
        }
        // `searchParams` меняется только при изменении query
    }, [searchParams]);

    // Action Handlers
    const handleCancelOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/cancel/`).then(data => {
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent(t('order_canceled_success'))}`);
        }).catch(_ => null).finally(() => setLoading(false));
    };

    const handleExecuteOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/execute/`).then(data => {
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent(t('order_completed_success'))}`);
        }).catch(_ => null).finally(() => setLoading(false));
    };
    const handleDeleteOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/delete/`).then(data => {
            Message.success(t('order_deleted_success'))
            if (onOrderDeleted) onOrderDeleted();
        }).catch(_ => null).finally(() => setLoading(false));
    };

    const handleResendNotificationOrder = () => {
        setLoading(true);
        api.post(`/api/v1/orders/${order.id}/resend_payment_notification/`).then(data => {
            pprint(`Order ID: ${order.id} notification resent`, data);
            onSomeUpdatingOrderAction(data);
            navigate(`?success_message=${encodeURIComponent(t('order_notification_resent_success'))}`);
        }).catch(_ => null).finally(() => setLoading(false));
    };

    const handleRedirectToPayment = () => {
        if (order.payment?.payment_url) window.location.href = order.payment.payment_url;
        else {
            if (order.payment_system === 'handmade') Message.info(t('contact_admin_for_payment'));
            else if (order.payment_system === 'balance') Message.success(t('order_completed_success'));
            else Message.error(t('payment_link_not_found'));
        }
    };

    const handleRedirectToRefund = () => navigate(`/refund/${order.id}`);


    const handlePay = () => {
        if (order.payment_system !== 'cloud_payment' && order.payment_system !== 'ckassa') {
            return handleRedirectToPayment();
        }
        if (order.payment_system === 'cloud_payment') {
            window.location.href = `/cloudpayments/pay/${order.id}/`;
        }
        if (order.payment_system === 'ckassa') {
            handleRedirectToPayment();
        }
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
                label: t('execute'),
                onClick: handleExecuteOrder,
                style: {backgroundColor: plt.text.primary + '22'},
            });
            actions.push({
                label: t('notification'),
                onClick: handleResendNotificationOrder,
                style: {backgroundColor: plt.text.primary + '22'},
            });
            actions.push({
                label: t('delete'),
                onClick: handleDeleteOrder,
                style: {backgroundColor: theme.colors.error.main},
            });
        }

        // Добавляем действие для запроса возврата, если заказ не инициализирован, не отменен и не возвращен
        if (!order.is_inited && !order.is_cancelled && !order.is_refunded) {
            actions.push({
                label: t('request_refund'),
                onClick: handleRedirectToRefund,
                style: {backgroundColor: plt.text.primary + '22'},
            });
        }

        // Добавляем действие для отмены заказа, если заказ инициализирован, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            actions.push({
                label: t('cancel_order'),
                onClick: handleCancelOrder,
                style: {backgroundColor: plt.text.primary + '22'},
            });
        }

        // Добавляем действие "Оплатить", если заказ инициализирован, не оплачен, не отменен, не исполнен и не возвращен
        if (order.is_inited && !order.is_paid && !order.is_cancelled && !order.is_executed && !order.is_refunded) {
            // actions.push({
            //     label: 'Pay',
            //     onClick: handleRedirectToPayment,
            //     style: {backgroundColor: plt.info.main},
            // });
            actions.push({
                label: t('pay'),
                onClick: handlePay,
                style: {backgroundColor: plt.info.main},
            });
        }

        return actions;
    };

    const actions = getActions();

    return (
        <FRSC g={1} wrap>
            {extended ? (
                <>
                    {actions.map((action, index) =>
                        action.disabled
                            ? <span key={index}>{action.label}</span>
                            : <Button
                                key={index}
                                className="h-min px-2 pt-6px"
                                style={{color: plt.text.primary, ...action.style}}
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
            <PaymentTypePickerModal
                open={payModal}
                onClose={() => setPayModal(false)}
                order={order}
                onPaymentInited={onSomeUpdatingOrderAction}
            />
        </FRSC>
    );
};

export default OrderActions;
