// Modules/Order/PaymentTypePicker.tsx
import React, {useEffect, useState} from 'react';
import {ICurrency, ICurrencyWithPrice, IPaymentSystem, IProductPrice} from "types/commerce/shop";
import RadioLine from "Core/components/elements/RadioLine";

import logoTBank from '../../Static/img/icon/tbank/logo.svg'
import logoCloudPayments from '../../Static/img/icon/cloudpayments/logo.svg'
import logoFreeKassa from '../../Static/img/icon/freekassa/logo.png'
import RadioCustomLine from "Core/components/elements/RadioCustomLine";
import {FC, FR, FRCC} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";
import {useApi} from "../Api/useApi";
import CircularProgress from "Core/components/elements/CircularProgress";
import pprint from 'Utils/pprint';
import {useTranslation} from "react-i18next";

interface PaymentTypePickerProps {
    prices?: IProductPrice[];
    setPaymentCurrency: (currency: ICurrencyWithPrice | null) => void;
    setPaymentSystem: (system: IPaymentSystem | null) => void;
    excluded_payment_systems?: IPaymentSystem[];
}

const PaymentTypePicker: React.FC<PaymentTypePickerProps> = (
    {
        prices = [],
        setPaymentCurrency,
        setPaymentSystem,
        excluded_payment_systems = []
    }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentTypes, setPaymentTypes] = useState<{ [key: string]: IPaymentSystem[] }>({});
    const [selectedPaymentType, setSelectedPaymentType] = useState<IPaymentSystem | null>(null);
    const {plt, theme} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/payment/types/').then(data => {
            setPaymentTypes(data)
        }).catch(_ => null).finally(() => {
            setLoading(false);
        });
    }, [api]);

    useEffect(() => {
        if (Object.keys(paymentTypes).length === 0) return; // Wait until paymentTypes are loaded
        if (prices.length === 1) {
            const only = prices[0];
            const initialCurrency: ICurrencyWithPrice = {currency: only.currency as ICurrency, priceObject: only};
            setSelectedCurrency(only.currency);
            setPaymentCurrency(initialCurrency);
            const availablePaymentTypes = paymentTypes[only.currency];
            if (availablePaymentTypes?.length === 1) {
                setSelectedPaymentType(availablePaymentTypes[0]);
                setPaymentSystem(availablePaymentTypes[0]);
            } else {
                setSelectedPaymentType(null);
                setPaymentSystem(null);
            }
            return;
        }
        if (prices.length > 1) {
            const rubPrice = prices.find(price => price.currency === 'RUB');
            if (rubPrice) {
                const initialCurrency: ICurrencyWithPrice = {currency: 'RUB', priceObject: rubPrice};
                setSelectedCurrency('RUB');
                setPaymentCurrency(initialCurrency);
                const availablePaymentTypes = paymentTypes['RUB'];
                if (availablePaymentTypes?.length === 1) {
                    setSelectedPaymentType(availablePaymentTypes[0]);
                    setPaymentSystem(availablePaymentTypes[0]);
                } else {
                    setSelectedPaymentType(null);
                    setPaymentSystem(null);
                }
                return;
            }
        }
        if (prices.length === 0) {
            const currencies = Object.keys(paymentTypes);
            const cur = currencies.includes('RUB') ? 'RUB' : currencies[0];
            if (cur) {
                const currencyWithPrice: ICurrencyWithPrice = {currency: cur as ICurrency, priceObject: undefined};
                setSelectedCurrency(cur);
                setPaymentCurrency(currencyWithPrice);
                const availablePaymentTypes = paymentTypes[cur];
                if (availablePaymentTypes?.length === 1) {
                    setSelectedPaymentType(availablePaymentTypes[0]);
                    setPaymentSystem(availablePaymentTypes[0]);
                } else {
                    setSelectedPaymentType(null);
                    setPaymentSystem(null);
                }
            }
        }
    }, [prices, paymentTypes, setPaymentCurrency, setPaymentSystem]);

    const handleCurrencyChange = (currency: string | number) => {
        const currencyStr = currency as ICurrency;
        setSelectedCurrency(currencyStr);
        const priceObject = prices.find(price => price.currency === currencyStr) || undefined;
        const currencyWithPrice: ICurrencyWithPrice = {currency: currencyStr, priceObject};
        setPaymentCurrency(currencyWithPrice);
        const availablePaymentTypes = paymentTypes[currencyStr];
        if (availablePaymentTypes?.length === 1) {
            setSelectedPaymentType(availablePaymentTypes[0]);
            setPaymentSystem(availablePaymentTypes[0]);
        } else {
            setSelectedPaymentType(null);
            setPaymentSystem(null);
        }
    };
    const handlePaymentTypeChange = (paymentType: string | number) => {
        const paymentTypeStr = paymentType as string;
        setSelectedPaymentType(paymentTypeStr as IPaymentSystem);
        setPaymentSystem(paymentTypeStr as IPaymentSystem);
    };
    const filteredPaymentTypes =
        paymentTypes[selectedCurrency]?.filter(
            (pt) => !excluded_payment_systems.includes(pt)
        ) || [];

    useEffect(() => {
        pprint(filteredPaymentTypes)
        if (filteredPaymentTypes.length > 0) {
            // либо ничего не выбрано, либо выбранной уже нет в списке
            if (!selectedPaymentType || !filteredPaymentTypes.includes(selectedPaymentType)) {
                const prefer = filteredPaymentTypes.find(pt => pt === 'freekassa');
                const paymentToSelect = prefer ?? filteredPaymentTypes[0];
                setSelectedPaymentType(paymentToSelect);
                setPaymentSystem(paymentToSelect);
            }
        } else {
            // Если нет платёжных систем, то сбрасываем
            setSelectedPaymentType(null);
            setPaymentSystem(null);
        }
    }, [filteredPaymentTypes, selectedPaymentType, setPaymentSystem]);


    const currencyOptions =
        prices.length > 0
            ? prices.map(price => ({value: price.currency, label: price.currency}))
            : Object.keys(paymentTypes).map(c => ({value: c, label: c}));

    return (
        <FC g={1}>
            {currencyOptions.length > 1 && (
                <FC>
                    <span>Select the currency</span>
                    <RadioLine
                        options={currencyOptions}
                        selectedValue={selectedCurrency}
                        onChange={handleCurrencyChange}
                        className="w-100"
                        itemClass={'px-3'}
                    />
                </FC>
            )}
            {loading && <FR mt={1}><CircularProgress size={'40px'}/></FR>}
            {selectedCurrency && filteredPaymentTypes?.length > 0 && (
                <RadioCustomLine
                    options={filteredPaymentTypes.reverse().map(paymentType => ({
                        value: paymentType,
                        content: paymentType.includes('tbank')
                            ? <FRCC
                                cls={'ftrans-300-eio'} px={1.2} pt={'.3rem'} pb={'.2rem'} rounded={3} g={'.4rem'}
                                bg={plt.text.primary + '07'}
                                boxShadow={paymentType === selectedPaymentType
                                    ? '0 0 3px 1px' + theme.colors.secondary.main
                                    : ''}>
                                <img
                                    src={logoTBank}
                                    alt={`Иконка ${paymentType}`}
                                    style={{maxHeight: 16, marginTop: 1}}
                                />
                                <span style={{
                                    fontWeight: 800,
                                    fontSize: '1.035rem',
                                }}>{
                                    paymentType === "tbank"
                                        ? 'TBank'
                                        : paymentType === "tbank_installment"
                                            ? 'TBank Рассрочка'
                                            : ''
                                }</span>
                            </FRCC>
                            : paymentType.includes('cloud_payment')
                                ? <FRCC
                                    cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                    bg={plt.text.primary + '07'}
                                    boxShadow={paymentType === selectedPaymentType
                                        ? '0 0 3px 1px' + theme.colors.secondary.main
                                        : ''}>
                                    <img
                                        src={logoCloudPayments}
                                        alt={`Иконка ${paymentType}`}
                                        style={{maxHeight: 25,}}
                                    /><span style={{
                                    whiteSpace: 'nowrap',
                                    fontWeight: 800,
                                    fontSize: '1.035rem',
                                }}>Cloud Payments</span>
                                </FRCC>
                                : paymentType.includes('freekassa')
                                    ? <FRCC
                                        cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                        bg={plt.text.primary + '07'}
                                        boxShadow={paymentType === selectedPaymentType
                                            ? '0 0 3px 1px' + theme.colors.secondary.main
                                            : ''}>
                                        <img
                                            src={logoFreeKassa}
                                            alt={`Иконка ${paymentType}`}
                                            style={{maxHeight: 25,}}
                                        />
                                    </FRCC>
                                    : paymentType.includes('ckassa')
                                        ? <FRCC
                                            cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                            bg={plt.text.primary + '07'}
                                            boxShadow={paymentType === selectedPaymentType
                                                ? '0 0 3px 1px' + theme.colors.secondary.main
                                                : ''}>
                                            CKassa
                                        </FRCC>
                                    : paymentType.includes('handmade')
                                        ? <FRCC
                                            cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                            bg={plt.text.primary + '07'}
                                            boxShadow={paymentType === selectedPaymentType
                                                ? '0 0 3px 1px' + theme.colors.secondary.main
                                                : ''}>
                                            {/*<img*/}
                                            {/*    src={logoCloudPayments}*/}
                                            {/*    alt={`Иконка ${paymentType}`}*/}
                                            {/*    style={{maxHeight: 25,}}*/}
                                            {/*/>*/}
                                            <span style={{
                                                opacity: '60%',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 300,
                                                fontSize: '1.035rem',
                                            }}>{t('by_private_message')}</span>
                                        </FRCC>
                                        : <FRCC
                                            cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                            bg={plt.text.primary + '07'}
                                            boxShadow={paymentType === selectedPaymentType
                                                ? '0 0 3px 1px' + theme.colors.secondary.main
                                                : ''}>
                                            {paymentType === 'balance'
                                                ? <span style={{whiteSpace: 'nowrap'}}>By Balance</span>
                                                : paymentType
                                            }
                                        </FRCC>
                    }))}
                    maxWidth={330}
                    selectedValue={selectedPaymentType}
                    onChange={(val) => handlePaymentTypeChange(String(val))}
                    className="w-100 frc gap-2 flex-wrap mt-1"
                    itemClass={''}
                />
            )}
        </FC>
    );
};

export default PaymentTypePicker;
