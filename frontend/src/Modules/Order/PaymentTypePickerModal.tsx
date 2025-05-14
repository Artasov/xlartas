// Modules/Order/PaymentTypePickerModal.tsx
import React, {useState} from 'react';
import Modal from 'Core/components/elements/Modal/Modal';
import PaymentTypePicker from './PaymentTypePicker';
import {ICurrencyWithPrice, IOrder, IPaymentSystem} from 'types/commerce/shop';
import Button from 'Core/components/elements/Button/Button';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {useApi} from '../Api/useApi';
import {FC, FRE} from "WideLayout/Layouts";

interface Props {
    open: boolean;
    onClose: () => void;
    order: IOrder;
    onPaymentInited: (updated: IOrder) => void;
}

const PaymentTypePickerModal: React.FC<Props> = ({open, onClose, order, onPaymentInited}) => {
    const {api} = useApi();
    const [currency, setCurrency] = useState<ICurrencyWithPrice | null>(null);
    const [system, setSystem] = useState<IPaymentSystem | null>(null);
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        if (!currency || !system) {
            Message.error('Выберите валюту и способ оплаты');
            return;
        }
        setLoading(true);
        try {
            const resp = await api.post(`/api/v1/orders/${order.id}/init-payment/`, {
                payment_system: system,
                currency: currency.currency,
                amount: currency.priceObject?.amount,
            });
            onPaymentInited({...order, payment: resp.data, is_inited: true});
            onClose();
            // Если пришла ссылка → редиректим
            if (resp.data?.payment_url) window.location.href = resp.data.payment_url;
            // Для CloudPayments переадресуем на страницу виджета
            if (system === 'cloud_payment') window.location.href = `/cloudpayments/pay/${order.id}/`;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal cls={'w-100 maxw-440px'} isOpen={open} onClose={onClose} title="Оплатить заказ">
            <FC g={2}>
                <PaymentTypePicker
                    prices={order.product.prices}
                    setPaymentCurrency={setCurrency}
                    setPaymentSystem={setSystem}
                />
                <FRE g={1}>
                    <Button variant="outlined" onClick={onClose}>Отмена</Button>
                    <Button variant="contained" disabled={loading} onClick={confirm}>
                        {loading ? <CircularProgress size="20px"/> : 'Продолжить'}
                    </Button>
                </FRE>
            </FC>
        </Modal>
    );
};

export default PaymentTypePickerModal;
