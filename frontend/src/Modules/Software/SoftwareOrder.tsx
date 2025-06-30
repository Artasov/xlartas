// Modules/Software/SoftwareOrder.tsx
import React, {useContext, useEffect, useState} from 'react';
import {Button, Dialog, DialogContent, DialogTitle, IconButton, Slider, useMediaQuery,} from '@mui/material';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC, FCC, FR, FRC, FRSC} from 'wide-containers';
import {ICurrencyWithPrice, IPaymentSystem} from 'types/commerce/shop';
import {ISoftware} from './Types/Software';
import {IPromocode} from 'types/commerce/promocode';
import PromoCodeField from 'Order/PromoCodeField';
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
                Товар сейчас не продается.
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
                `Минимальное количество часов: ${software.min_license_order_hours}`
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

            Message.success('Заказ успешно создан.', 2, 5000);

            /*  Если back сразу вернул ссылку — открываем её  */
            if (typeof data === 'string' && data.startsWith('http')) {
                window.open(data, '_blank');
            } else if (data?.id) {
                /*  Редирект на страницу заказа  */
                navigate(`/orders/${data.id}/?pay=1`);
            }

            onSuccess?.(data);
            setPayModal(false);
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
                    Buy {licenseHours} hours for {totalPrice} RUB
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

            {showPromo && (
                <PromoCodeField
                    cls="mt-1"
                    currency="RUB"
                    productId={software.id}
                    onValidChange={(isValid: boolean | null, promocode?: IPromocode) => {
                        setIsPromoValid(isValid);
                        setPromocodeData(promocode ?? null);
                    }}
                    onPromoCodeChange={code => setPromoCode(code)}
                    revalidateKey={revalidateKey}
                />
            )}

            {creatingOrder && <CircularProgress size="60px"/>}

            <Dialog open={payModal} onClose={() => setPayModal(false)}>
                <DialogTitle><FR opacity={70}>Payment of the order</FR></DialogTitle>
                <DialogContent>
                    <FC g={2} maxW={400}>
                        <PaymentTypePicker
                            prices={software.prices}
                            setPaymentCurrency={setCurrency}
                            setPaymentSystem={setSystem}
                        />
                        {system === 'freekassa' && <FR>При оплате через FreeKassa менее 1001 RUB нужно иметь/зарегистрировать кошелек FK Wallet и пополнить его, либо оплачивать криптой. Более 1000 RUB вы можете оплатить через СБП / Картой и всеми удобными способами. Это ограничения FreeKassa.</FR>}
                        <FRC g={1}>
                            {/*<Button onClick={() => setPayModal(false)}>*/}
                            {/*    Cancel*/}
                            {/*</Button>*/}
                            <Button disabled={creatingOrder} onClick={createOrder} sx={{
                                fontWeight: 'bold', width: '100%',
                            }}>
                                {creatingOrder
                                    ? <CircularProgress size="20px"/>
                                    : 'Next'
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
