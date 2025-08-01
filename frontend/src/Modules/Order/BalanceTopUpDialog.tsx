// Modules/Order/BalanceTopUpDialog.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dialog, DialogContent, DialogTitle, TextField} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC, FR} from 'wide-containers';
import PaymentSystemInfo from './PaymentSystemInfo';

import {useApi} from 'Api/useApi';
import PaymentTypePicker from 'Order/PaymentTypePicker';
import {ICurrencyWithPrice, IPaymentSystem, IProduct} from 'types/commerce/shop';
import {Message} from 'Core/components/Message';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {useAuth} from 'Auth/AuthContext';

interface BalanceTopUpDialogProps {
    open: boolean;
    onClose: () => void;
}

const BalanceTopUpDialog: React.FC<BalanceTopUpDialogProps> = ({open, onClose}) => {
    const {api} = useApi();
    const {notAuthentication} = useErrorProcessing();
    const {isAuthenticated} = useAuth();
    const {t} = useTranslation();

    const [product, setProduct] = useState<IProduct | null>(null);
    const [amount, setAmount] = useState<number>(100);
    const [currency, setCurrency] = useState<ICurrencyWithPrice | null>(null);
    const [system, setSystem] = useState<IPaymentSystem | null>(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (open) {
            api.get('/api/v1/balance/product/latest/').then(p => setProduct(p)).catch(() => null);
        }
    }, [open, api]);

    useEffect(() => {
        if (open) {
            setCurrency(null);
            setSystem(null);
            setAmount(100);
        }
    }, [open]);

    const handleCreate = async () => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }
        if (!product || !currency || !system || amount <= 0) return;
        setLoading(true);
        try {
            const payload = {
                product: product.id,
                currency: currency.currency,
                payment_system: system,
                requested_amount: amount,
            };
            const data = await api.post('/api/v1/orders/create/', payload);
            if (data?.payment_url) window.open(data.payment_url, '_blank');
            Message.success(t('balance_topup_created'));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !loading && onClose()}
        >
            <DialogTitle sx={{pb: 1.5}}>{t('top_up_balance')}</DialogTitle>
            <DialogContent sx={{position: 'relative'}}>
                {!product ? (
                    <CircularProgressZoomify in size="40px"/>
                ) : (
                    <FC g={.7} maxW={400}>
                        <TextField
                            type="number"
                            label="Сумма"
                            size={'small'}
                            fullWidth
                            sx={{mt: .7}}
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                        />
                        <PaymentTypePicker
                            prices={product.prices}
                            setPaymentCurrency={setCurrency}
                            setPaymentSystem={setSystem}
                            excluded_payment_systems={["balance"]}
                        />
                        <PaymentSystemInfo
                            system={system}
                            freekassaExtra={<FR mb={0.5}>{t('freekassa_help_desc')}</FR>}
                        />
                        <Button onClick={handleCreate} disabled={loading} sx={{fontWeight: 'bold'}}>
                            {loading ? <CircularProgressZoomify mt={5} in size="20px"/> : t('next')}
                        </Button>
                    </FC>
                )}
            </DialogContent>
        </Dialog>
    );
};
export default BalanceTopUpDialog;