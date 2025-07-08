import React, {useEffect, useState} from 'react';
import {ICurrency, ICurrencyWithPrice, IPaymentSystem, IProductPrice} from 'types/commerce/shop';
import RadioLine from 'Core/components/elements/RadioLine';

import logoTBank from '../../Static/img/icon/tbank/logo.svg';
import logo from '../../Static/img/icon/logo.png';
import logoCKassa from '../../Static/img/icon/ckassa/main_logo.png';
import logoCloudPayments from '../../Static/img/icon/cloudpayments/logo.svg';
import logoFreeKassa from '../../Static/img/icon/freekassa/logo.png';

import RadioCustomLine from 'Core/components/elements/RadioCustomLine';
import {FC, FR, FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {useApi} from 'Api/useApi';
import CircularProgress from 'Core/components/elements/CircularProgress';
import pprint from 'Utils/pprint';
import {useTranslation} from 'react-i18next';
import PaymentTypeButton from './PaymentTypeButton'; // ⭐️ новинка

interface PaymentTypePickerProps {
    prices?: IProductPrice[];
    setPaymentCurrency: (currency: ICurrencyWithPrice | null) => void;
    setPaymentSystem: (system: IPaymentSystem | null) => void;
    excluded_payment_systems?: IPaymentSystem[];
}

const paymentButtonHeight = '40px';

const PaymentTypePicker: React.FC<PaymentTypePickerProps> = (
    {
        prices = [],
        setPaymentCurrency,
        setPaymentSystem,
        excluded_payment_systems = [],
    }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentTypes, setPaymentTypes] = useState<{ [key: string]: IPaymentSystem[] }>({});
    const [selectedPaymentType, setSelectedPaymentType] = useState<IPaymentSystem | null>(null);
    const {plt, theme} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();

    /* -------------------- Загрузка типов оплаты -------------------- */
    useEffect(() => {
        setLoading(true);
        api
            .get('/api/v1/payment/types/')
            .then((data) => setPaymentTypes(data))
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [api]);

    /* -------------------- Инициализация валюты/системы -------------------- */
    useEffect(() => {
        if (Object.keys(paymentTypes).length === 0) return; // ждём пока загрузятся

        const selectCurrencyAndMaybeSystem = (cur: ICurrency, priceObj?: IProductPrice) => {
            setSelectedCurrency(cur);
            setPaymentCurrency({currency: cur, priceObject: priceObj});
            const pts = paymentTypes[cur];
            if (pts?.length === 1) {
                setSelectedPaymentType(pts[0]);
                setPaymentSystem(pts[0]);
            } else {
                setSelectedPaymentType(null);
                setPaymentSystem(null);
            }
        };

        if (prices.length === 1) {
            const only = prices[0];
            selectCurrencyAndMaybeSystem(only.currency as ICurrency, only);
            return;
        }
        if (prices.length > 1) {
            const rubPrice = prices.find((p) => p.currency === 'RUB');
            if (rubPrice) {
                selectCurrencyAndMaybeSystem('RUB', rubPrice);
                return;
            }
        }
        // нет цен — берём первую доступную валюту
        if (prices.length === 0) {
            const currencies = Object.keys(paymentTypes);
            const cur = currencies.includes('RUB') ? 'RUB' : currencies[0];
            if (cur) selectCurrencyAndMaybeSystem(cur as ICurrency);
        }
    }, [prices, paymentTypes, setPaymentCurrency, setPaymentSystem]);

    /* -------------------- Смена валюты -------------------- */
    const handleCurrencyChange = (currency: string | number) => {
        const currencyStr = currency as ICurrency;
        setSelectedCurrency(currencyStr);

        const priceObject = prices.find((p) => p.currency === currencyStr);
        setPaymentCurrency({currency: currencyStr, priceObject});
        const pts = paymentTypes[currencyStr];
        if (pts?.length === 1) {
            setSelectedPaymentType(pts[0]);
            setPaymentSystem(pts[0]);
        } else {
            setSelectedPaymentType(null);
            setPaymentSystem(null);
        }
    };

    /* -------------------- Смена платёжной системы -------------------- */
    const handlePaymentTypeChange = (paymentType: string | number) => {
        const pt = paymentType as IPaymentSystem;
        setSelectedPaymentType(pt);
        setPaymentSystem(pt);
    };

    /* -------------------- Фильтр доступных систем -------------------- */
    const filteredPaymentTypes =
        paymentTypes[selectedCurrency]?.filter((pt) => !excluded_payment_systems.includes(pt)) || [];

    useEffect(() => {
        pprint(filteredPaymentTypes);
        if (filteredPaymentTypes.length > 0) {
            if (!selectedPaymentType || !filteredPaymentTypes.includes(selectedPaymentType)) {
                const prefer = filteredPaymentTypes.find(
                    (pt) => pt === 'ckassa' // ВЫБРАНО ПО УМОЛЧАНИЮ
                );
                const paymentToSelect = prefer ?? filteredPaymentTypes[0];
                setSelectedPaymentType(paymentToSelect);
                setPaymentSystem(paymentToSelect);
            }
        } else {
            setSelectedPaymentType(null);
            setPaymentSystem(null);
        }
    }, [filteredPaymentTypes, selectedPaymentType, setPaymentSystem]);

    /* -------------------- Опции валют -------------------- */
    const currencyOptions =
        prices.length > 0
            ? prices.map((p) => ({value: p.currency, label: p.currency}))
            : Object.keys(paymentTypes).map((c) => ({value: c, label: c}));

    /* -------------------- Рендер кнопки по системе -------------------- */
    const renderPaymentButton = (paymentType: IPaymentSystem) => {
        const isSelected = paymentType === selectedPaymentType;

        /* ---------- TBank & рассрочка ---------- */
        if (paymentType.includes('tbank')) {
            return (
                <PaymentTypeButton selected={isSelected} key={paymentType} px={1} py={.3}>
                    <img src={logoTBank} alt={`Иконка ${paymentType}`} style={{maxHeight: 16, marginTop: 1}}/>
                    <span style={{fontWeight: 800, fontSize: '1.035rem'}}>
                        {paymentType === 'tbank' ? 'TBank' : 'TBank Рассрочка'}
                    </span>
                </PaymentTypeButton>
            );
        }

        /* ---------- CloudPayments ---------- */
        if (paymentType.includes('cloud_payment')) {
            return (
                <PaymentTypeButton selected={isSelected} key={paymentType} px={1} py={.3}>
                    <img src={logoCloudPayments} alt={`Иконка ${paymentType}`}
                         style={{maxHeight: paymentButtonHeight}}/>
                    <span style={{whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.035rem'}}>
                        Cloud Payments
                    </span>
                </PaymentTypeButton>
            );
        }

        /* ---------- FreeKassa ---------- */
        if (paymentType.includes('freekassa')) {
            return (
                <PaymentTypeButton selected={isSelected} key={paymentType} px={1} py={.3}>
                    <img src={logoFreeKassa} alt={`Иконка ${paymentType}`} style={{maxHeight: paymentButtonHeight}}/>
                </PaymentTypeButton>
            );
        }

        /* ---------- CKassa ---------- */
        if (paymentType.includes('ckassa')) {
            return (
                <PaymentTypeButton selected={isSelected} key={paymentType} px={1} py={.3}>
                    <img src={logoCKassa} alt={`Иконка ${paymentType}`} style={{maxHeight: paymentButtonHeight}}/>
                </PaymentTypeButton>
            );
        }

        /* ---------- Ручной перевод / личные сообщения ---------- */
        if (paymentType.includes('handmade')) {
            return (
                <PaymentTypeButton selected={isSelected} key={paymentType} px={1.4} py={.3}>
                    <span
                        style={{
                            opacity: '60%',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            fontSize: '1.4rem',
                        }}
                    >
                        {t('by_private_message')}
                    </span>
                </PaymentTypeButton>
            );
        }

        /* ---------- Баланс или прочее ---------- */
        return (
            <PaymentTypeButton selected={isSelected} key={paymentType} pl={1} pr={1.5}>
                {paymentType === 'balance' ? (
                    <FRCC g={.8} fontWeight={'bold'} fontSize={'1.3rem'} sx={{whiteSpace: 'nowrap'}}>
                        <img src={logo} alt={`Иконка ${paymentType}`}
                             style={{maxHeight: `calc(${paymentButtonHeight} - 10px)`}}/>
                        <span style={{opacity: '70%', letterSpacing: '.12rem'}}>{t('by_balance')}</span>
                    </FRCC>
                ) : (
                    paymentType
                )}
            </PaymentTypeButton>
        );
    };

    return (
        <FC g={1}>
            {/* ---------- Блок выбора валюты ---------- */}
            {currencyOptions.length > 1 && (
                <FC>
                    <span>Select the currency</span>
                    <RadioLine
                        options={currencyOptions}
                        selectedValue={selectedCurrency}
                        onChange={handleCurrencyChange}
                        className="w-100"
                        itemClass="px-3"
                    />
                </FC>
            )}

            {/* ---------- Лоадер ---------- */}
            {loading && <FR mt={1}> <CircularProgress size={'40px'}/> </FR>}

            {/* ---------- Платёжные системы ---------- */}
            {selectedCurrency && filteredPaymentTypes.length > 0 && (
                <RadioCustomLine
                    options={filteredPaymentTypes
                        .slice() // копия, чтобы не мутировать
                        .reverse()
                        .map((pt) => ({
                            value: pt,
                            content: renderPaymentButton(pt),
                        }))}
                    maxWidth={330}
                    selectedValue={selectedPaymentType}
                    onChange={(val) => handlePaymentTypeChange(String(val))}
                    className="w-100 frc gap-2 flex-wrap mt-1"
                />
            )}
        </FC>
    );
};

export default PaymentTypePicker;
