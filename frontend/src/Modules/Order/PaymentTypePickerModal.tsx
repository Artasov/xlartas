// Modules/Order/PaymentTypePickerModal.tsx
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import PaymentTypePicker from './PaymentTypePicker';
import {ICurrencyWithPrice, IOrder, IPaymentSystem} from 'types/commerce/shop';
import {Button} from '@mui/material';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {useApi} from '../Api/useApi';
import {FC, FRE} from "wide-containers";

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
    const {t} = useTranslation();

    const confirm = async () => {
        if (!currency || !system) {
            Message.error(t('select_currency_payment'));
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
        <Dialog open={open} onClose={onClose} className={'w-100 maxw-440px'}>
            <DialogTitle>{t('payment_of_the_order')}</DialogTitle>
            <DialogContent>
                <FC g={2}>
                    <PaymentTypePicker
                        prices={order.product.prices}
                        setPaymentCurrency={setCurrency}
                        setPaymentSystem={setSystem}
                    />
                    <FRE g={1}>
                        <Button variant="outlined" onClick={onClose}>{t('cancel')}</Button>
                        <Button variant="contained" disabled={loading} onClick={confirm}>
                            {loading ? <CircularProgress size="20px"/> : t('next')}
                        </Button>
                    </FRE>
                </FC>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentTypePickerModal;
