// Modules/Software/SoftwareOrder.tsx
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Collapse, Dialog, DialogContent, DialogTitle, IconButton, Slider, useMediaQuery} from '@mui/material';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC, FCC, FR, FRC, FRSC} from 'wide-containers';
import {ICurrencyWithPrice, IPaymentSystem} from 'types/commerce/shop';
import {ISoftware} from './Types/Software';
import {IPromocode} from 'types/commerce/promocode';
import PromoCodeField from 'Order/PromoCodeField';
import PaymentSystemInfo from '../Order/PaymentSystemInfo';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {useNavigate} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import PaymentTypePicker from 'Order/PaymentTypePicker';

/* ----------  utils ---------- */
/**
 * Возвращает целое число:
 * cost(H) = round( amount * (H^exponent) + offset )
 */
function calculatePrice(
    hours: number,
    amount: number,
    exponent: number,
    offset: number
): number {
    if (hours <= 0) return 0;
    const raw = amount * Math.pow(hours, exponent) + offset;
    return Math.round(raw);
}

interface SoftwareOrderProps {
    software: ISoftware;
    onSuccess?: (data?: any) => void;
}

const SoftwareOrder: React.FC<SoftwareOrderProps> = ({software, onSuccess}) => {
    /* ------------------------------------------------------------------ */
    /*  state                                                             */
    /* ------------------------------------------------------------------ */
    const [licenseHours, setLicenseHours] = useState(
        software.min_license_order_hours || 1
    );
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [payModal, setPayModal] = useState(false);

    const {user, isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const [_isPromoValid, setIsPromoValid] = useState<boolean | null>(null);
    const [promoCode, setPromoCode] = useState<string>('');
    const [_promocodeData, setPromocodeData] = useState<IPromocode | null>(null);
    const [revalidateKey, setRevalidateKey] = useState<number>(0);
    const [showPromo, setShowPromo] = useState(false);

    const [currency, setCurrency] = useState<ICurrencyWithPrice | null>(null);
    const [system, setSystem] = useState<IPaymentSystem | null>(null);

    const navigate = useNavigate();
    const {api} = useApi();
    const {notAuthentication} = useErrorProcessing();
    const {t} = useTranslation();

    const _isGt576 = useMediaQuery('(min-width: 576px)');
    const _isGt740 = useMediaQuery('(min-width: 740px)');

    /* ------------------------------------------------------------------ */
    /*  promo                                                             */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        if (promoCode) {
            setIsPromoValid(null);
            setPromocodeData(null);
            setRevalidateKey(prev => prev + 1);
        }
    }, [software, promoCode]);

    /* ------------------------------------------------------------------ */
    /*  price                                                             */
    /* ------------------------------------------------------------------ */
    if (!software.prices || software.prices.length === 0) {
        return (
            <FCC w="100%" g=".2rem">
                {t('product_not_for_sale')}
            </FCC>
        );
    }

    const priceRow = software.prices[0];
    const amount: number = parseFloat(priceRow.amount.toString()) || 0;
    const exponent: number = parseFloat(priceRow.exponent?.toString() || '1');
    const offset: number = parseFloat(priceRow.offset?.toString() || '0');
    const totalPrice = calculatePrice(licenseHours, amount, exponent, offset);


    /* ------------------------------------------------------------------ */
    /*  order create                                                      */
    /* ------------------------------------------------------------------ */
    const createOrder = async () => {
        if (licenseHours < software.min_license_order_hours) {
            Message.error(
                t('min_hours_message', {hours: software.min_license_order_hours})
            );
            return;
        }

        setCreatingOrder(true);
        try {
            const payload = {
                product: software.id,
                license_hours: licenseHours,
                currency: currency?.currency,
                payment_system: system,
                promocode: promoCode || null,
                email: user?.email ?? null,
            };
            const data = await api.post('/api/v1/orders/create/', payload);

            Message.success(t('order_created_success'), 2, 5000);

            /*  Если back сразу вернул ссылку — открываем её  */
            if (typeof data === 'string' && data.startsWith('http')) {
                window.open(data, '_blank');
            } else if (data?.id) {
                /*  Редирект на страницу заказа  */
                navigate(`/orders/${data.id}/?pay=1`);
            }

            onSuccess?.(data);
            setPayModal(false);
        } catch (_) {
        } finally {
            setCreatingOrder(false);
        }
    };

    /* ------------------------------------------------------------------ */
    /*  render                                                            */
    /* ------------------------------------------------------------------ */
    const openPayModal = () => {
        if (!isAuthenticated) {
            notAuthentication();
            return;
        }
        setPayModal(true);
    };

    return (
        <FCC w="100%" g=".2rem">
            <FC g={1}>
                <Button
                    size="small"
                    className="minw-250px fw-bold"
                    onClick={openPayModal}
                >
                    {t('buy_hours_for_price', {hours: licenseHours, price: totalPrice})}
                </Button>

                <FRSC>
                    <Slider
                        value={licenseHours}
                        onChange={(_, val) => setLicenseHours(val as number)}
                        min={software.min_license_order_hours}
                        max={3000}
                        step={1}
                        valueLabelDisplay="off"
                        className="w-100 ms-2 pt-2"
                    />
                    <IconButton
                        className="ms-3"
                        sx={{width: 36, height: 36}}
                        onClick={() => setShowPromo(prev => !prev)}
                    >
                        {showPromo
                            ? <RemoveRoundedIcon sx={{fontSize: '2rem'}}/>
                            : <AddRoundedIcon sx={{fontSize: '2rem'}}/>
                        }
                    </IconButton>
                </FRSC>
            </FC>

            <Collapse in={showPromo}>
                <PromoCodeField
                    cls="mt-1 mb-2"
                    currency="RUB"
                    productId={software.id}
                    onValidChange={(isValid: boolean | null, promocode?: IPromocode) => {
                        setIsPromoValid(isValid);
                        setPromocodeData(promocode ?? null);
                    }}
                    onPromoCodeChange={code => setPromoCode(code)}
                    revalidateKey={revalidateKey}
                />
            </Collapse>

            {creatingOrder && <CircularProgress size="60px"/>}

            <Dialog
                open={payModal}
                onClose={() => setPayModal(false)}
            >
                <DialogTitle sx={{pb: 1.3}}><FRC opacity={70}>{t('payment_of_the_order')}</FRC></DialogTitle>
                <DialogContent>
                    <FC maxW={370}>
                        <FC mb={1}>
                            <PaymentTypePicker
                                prices={software.prices}
                                setPaymentCurrency={setCurrency}
                                setPaymentSystem={setSystem}
                            />
                        </FC>
                        <PaymentSystemInfo
                            system={system}
                            freekassaExtra={<FR opacity={80} mb={0.5} fontSize={'.88rem'} sx={{lineHeight: '1.2rem'}}>{t('freekassa_note')}</FR>}
                        />
                        <FRC g={1} mt={1}>
                            <Button disabled={creatingOrder} onClick={createOrder} sx={{
                                fontWeight: 'bold', width: '100%',
                            }}>
                                {creatingOrder
                                    ? <CircularProgress size="20px"/>
                                    : t('next')
                                }
                            </Button>
                        </FRC>
                    </FC>
                </DialogContent>
            </Dialog>
        </FCC>
    );
};

export default SoftwareOrder;
