// Modules/Order/PaymentTypePicker.tsx
import React, {useEffect, useState} from 'react';
import {ICurrency, ICurrencyWithPrice, IPaymentSystem, IProductPrice} from "types/commerce/shop";
import RadioLine from "Core/components/elements/RadioLine";

import logoTBank from '../../Static/img/icon/tbank/logo.svg'
import logoCloudPayments from '../../Static/img/icon/cloudpayments/logo.svg'
import RadioCustomLine from "Core/components/elements/RadioCustomLine";
import {FC, FR, FRCC} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import {useApi} from "../Api/useApi";
import CircularProgress from "Core/components/elements/CircularProgress";

interface PaymentTypePickerProps {
    prices: IProductPrice[];
    setPaymentCurrency: (currency: ICurrencyWithPrice | null) => void;
    setPaymentSystem: (system: IPaymentSystem | null) => void;
    excluded_payment_systems?: IPaymentSystem[];
}

const PaymentTypePicker: React.FC<PaymentTypePickerProps> = (
    {
        prices,
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
        console.log(filteredPaymentTypes)
        if (filteredPaymentTypes.length > 0) {
            // либо ничего не выбрано, либо выбранной уже нет в списке
            if (!selectedPaymentType || !filteredPaymentTypes.includes(selectedPaymentType)) {
                const firstPayment = filteredPaymentTypes[0];
                setSelectedPaymentType(firstPayment);
                setPaymentSystem(firstPayment);
            }
        } else {
            // Если нет платёжных систем, то сбрасываем
            setSelectedPaymentType(null);
            setPaymentSystem(null);
        }
    }, [filteredPaymentTypes, selectedPaymentType, setPaymentSystem]);


    return (
        <FC g={1} px={1}>
            <FC>
                <span>Выберите валюту</span>
                <RadioLine
                    options={prices.map(price => ({value: price.currency, label: price.currency}))}
                    selectedValue={selectedCurrency}
                    onChange={handleCurrencyChange}
                    className="w-100"
                    itemClass={'px-3'}
                />
            </FC>
            {loading && <FR mt={1}><CircularProgress size={'40px'}/></FR>}
            {selectedCurrency && filteredPaymentTypes?.length > 0 && (
                <RadioCustomLine
                    options={filteredPaymentTypes.map(paymentType => ({
                        value: paymentType,
                        content: paymentType.includes('tbank')
                            ? <FRCC
                                cls={'ftrans-300-eio'} px={1.2} pt={'.3rem'} pb={'.2rem'} rounded={3} g={'.4rem'}
                                bg={plt.bg.primary35}
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
                                    bg={plt.bg.primary35}
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
                                : paymentType.includes('handmade')
                                    ? <FRCC
                                        cls={'ftrans-300-eio'} px={1.2} py={'.3rem'} rounded={3} g={'.4rem'}
                                        bg={plt.bg.primary35}
                                        boxShadow={paymentType === selectedPaymentType
                                            ? '0 0 3px 1px' + theme.colors.secondary.main
                                            : ''}>
                                        {/*<img*/}
                                        {/*    src={logoCloudPayments}*/}
                                        {/*    alt={`Иконка ${paymentType}`}*/}
                                        {/*    style={{maxHeight: 25,}}*/}
                                        {/*/>*/}
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            fontWeight: 800,
                                            fontSize: '1.035rem',
                                        }}>Через ЛС</span>
                                    </FRCC>
                                    : <span>{paymentType}</span>
                    }))}
                    maxWidth={300}
                    selectedValue={selectedPaymentType}
                    onChange={(val) => handlePaymentTypeChange(String(val))}
                    className="w-100 gap-2 flex-wrap mt-1"
                    itemClass={''}
                />
            )}
        </FC>
    );
};

export default PaymentTypePicker;
