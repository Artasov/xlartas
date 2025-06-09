// Modules/Order/PaymentSelector.tsx

import React, {useContext, useEffect, useRef, useState} from 'react';
import {ICurrencyWithPrice, IPaymentSystem, IProduct} from 'types/commerce/shop';
import {Message} from 'Core/components/Message';
import {Button} from '@mui/material';
import PaymentTypePicker from "Order/PaymentTypePicker";
import {FC, FCCC, FR, FRCC} from "wide-containers";
import {IPromocode} from "types/commerce/promocode";
import PromoCodeField from "Order/PromoCodeField";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {debounce} from 'lodash';
import {isEmail} from 'Utils/validator/base';
import {useTheme} from "Theme/ThemeContext";
import TextField from "@mui/material/TextField";
import installmentTBankLogo from '../../Static/img/icon/tbank/by_parts.svg'
import CircularProgress from "Core/components/elements/CircularProgress";
import pprint from "Utils/pprint";
import {useApi} from "../Api/useApi";

interface IProductInstallment {
    id: number;
}

interface PaymentSelectorProps {
    isLoading?: boolean;
    onPaymentSelection?: (currency: ICurrencyWithPrice, paymentSystem: IPaymentSystem) => void;
    onConfirm: (
        currency: ICurrencyWithPrice,
        paymentSystem: IPaymentSystem,
        promocodeId: number | null,
        email?: string,
    ) => void;
    disabled?: boolean;
    product: IProduct;
    employeeId?: number;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = (
    {
        isLoading = false,
        onPaymentSelection = () => {
        },
        onConfirm,
        disabled = false,
        product,
        employeeId
    }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<ICurrencyWithPrice | null>(null);
    const [selectedPaymentSystem, setSelectedPaymentSystem] = useState<IPaymentSystem | null>(null);
    const {user, isAuthenticated, logout} = useContext(AuthContext) as AuthContextType;
    const [isPromoValid, setIsPromoValid] = useState<boolean | null>(null);
    const [promoCode, setPromoCode] = useState<string>('');
    const [promocodeData, setPromocodeData] = useState<IPromocode | null>(null);
    const [installmentDuration, setInstallmentDuration] = useState<number | undefined>(undefined);
    const [revalidateKey, setRevalidateKey] = useState<number>(0);
    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean>(true);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);
    const emailCheckRef = useRef<ReturnType<typeof debounce> | null>(null);
    const {theme} = useTheme();
    const {api} = useApi();

    useEffect(() => {
        if (promoCode) {
            setIsPromoValid(null);
            setPromocodeData(null);
            setRevalidateKey(prev => prev + 1);
        }
    }, [product, selectedCurrency?.currency]);

    useEffect(() => {
        pprint('Payment Selector Product')
        pprint(product)
        if (emailTouched) {
            const valid = isEmail(email);
            setIsEmailValid(valid);
            setIsEmailAvailable(true);

            if (emailCheckRef.current) emailCheckRef.current.cancel();

            if (valid) {
                emailCheckRef.current = debounce(async () => {
                    api.post('/api/v1/check-email-exists/', {email}).then(data =>
                        setIsEmailAvailable(!data.exists)
                    ).catch((_) => Message.error('Ошибка при проверке email.'))
                }, 500);
                emailCheckRef.current();
            }
            return () => {
                if (emailCheckRef.current) emailCheckRef.current.cancel();
            };
        }
    }, [email, emailTouched, api]);

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailTouched(true);
    };

    const handlePaymentSelection = () => {
        if (selectedCurrency && selectedPaymentSystem) {
            if (!user?.email) {
                if (!email || !isEmailValid || !isEmailAvailable) {
                    setIsEmailValid(false);
                    Message.error('Пожалуйста, введите корректный и доступный email.');
                    return;
                }
            }
            onPaymentSelection(selectedCurrency, selectedPaymentSystem);
            onConfirm(
                selectedCurrency,
                selectedPaymentSystem,
                promocodeData ? promocodeData.id : null,
                user?.email || email,);
        } else {
            Message.error('Пожалуйста, выберите валюту и способ оплаты.');
        }
    };

    const finalPrice = (() => {
        const basePrice = selectedCurrency?.priceObject?.amount || null;
        if (basePrice === null) return null;
        if (isPromoValid && promocodeData) {
            const discount = promocodeData.discounts.find(d => d.product === product.id);
            if (discount) {
                if (promocodeData.discount_type === 'percentage') {
                    const discounted = basePrice - (basePrice * (discount.amount / 100));
                    return discounted < 0 ? 0 : discounted;
                } else if (promocodeData.discount_type === 'fixed_amount') {
                    const discounted = basePrice - discount.amount;
                    return discounted < 0 ? 0 : discounted;
                }
            }
        }
        return basePrice;
    })();

    const isButtonDisabled = (() => {
        if (promoCode.length === 0) return false;
        return isPromoValid === null || !isPromoValid || (!user?.email && (!isEmailValid || !isEmailAvailable));
    })();

    return (
        <FC g={1} maxW={270}>
            <PaymentTypePicker
                prices={product.prices}
                excluded_payment_systems={product.is_installment_available ? [] : ['tbank_installment']}
                setPaymentCurrency={setSelectedCurrency}
                setPaymentSystem={setSelectedPaymentSystem}
            />
            {selectedCurrency && <PromoCodeField
                cls={'mt-1'}
                currency={selectedCurrency?.currency}
                productId={product.id}
                employeeId={employeeId}
                onValidChange={(isValid: boolean | null, promocode?: IPromocode) => {
                    setIsPromoValid(isValid);
                    if (promocode) setPromocodeData(promocode);
                    else setPromocodeData(null);
                }}
                onPromoCodeChange={(code: string) => setPromoCode(code)}
                revalidateKey={revalidateKey}
            />}
            {!user?.email && <TextField
                label="Email"
                className={'mt-2'}
                variant="outlined"
                type="email"
                value={email}
                style={{
                    borderColor: !isEmailValid ? theme.colors.error.main : 'unset',
                }}
                onChange={handleEmailChange}
                onBlur={() => setEmailTouched(true)}
                fullWidth
                error={!isEmailValid || !isEmailAvailable}
                helperText={
                    !isEmailValid
                        ? 'Некорректный формат почты'
                        : emailTouched && !isEmailAvailable
                            ? 'Почта уже используется'
                            : undefined
                }/>
            }
            {selectedPaymentSystem === 'tbank' && finalPrice !== null && selectedCurrency && selectedPaymentSystem && <>
                <Button
                    disabled={isLoading || disabled || isButtonDisabled}
                    loading={isLoading || isButtonDisabled}
                    variant="contained"
                    className={'gap-2'}
                    onClick={handlePaymentSelection}>
                    <span style={{
                        fontSize: '1rem', fontWeight: 'bold', marginTop: '2px',
                    }}>Оплатить {Math.floor(finalPrice)} {selectedCurrency.currency}</span>
                </Button>
                <FRCC bg={'#111'} g={1} px={2} py={1.1} rounded={2}
                      onClick={handlePaymentSelection}>
                    {(isLoading || isButtonDisabled)
                        ? <CircularProgress size={40}/>
                        : <FR g={1}>
                            <img style={{
                                filter: 'invert(.99)'
                            }} src={installmentTBankLogo} alt=""/>
                            <FCCC ml={.7} fontWeight={'bold'} color={'#fefefe'}>
                                ДОЛЯМИ
                            </FCCC>
                            <FCCC fontWeight={'bold'} color={'#fefefe'}>
                                {Math.floor(finalPrice / 4)} * 4
                            </FCCC>
                        </FR>
                    }
                </FRCC>
            </>}
            {product.is_installment_available && finalPrice && <>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <h5>Доступные сроки рассрочки:</h5>
                    {[3, 6, 12].map((duration_month) => {
                        const monthly = Math.ceil(finalPrice / duration_month);
                        return (
                            <Button variant="contained"
                                    onClick={handlePaymentSelection}>
                                {duration_month} мес по ~{monthly}₽/мес
                            </Button>
                        );
                    })}
                </div>
            </>}
        </FC>
    );
};

export default PaymentSelector;