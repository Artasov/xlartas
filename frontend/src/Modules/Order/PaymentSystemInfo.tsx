import React from 'react';
import {useTranslation} from 'react-i18next';
import {Collapse} from '@mui/material';
import {FR} from 'wide-containers';
import PaymentSystemIcons from './PaymentSystemIcons';

import iconVisa from '../../Static/img/icon/payments/visa.svg';
import iconMastercard from '../../Static/img/icon/payments/mastercard.svg';
import iconMir from '../../Static/img/icon/payments/mir.svg';
import iconSBP from '../../Static/img/icon/payments/sbp.svg';
import iconSteam from '../../Static/img/icon/payments/steam.svg';
import iconBitcoin from '../../Static/img/icon/payments/bitcoin.svg';
import iconLitecoin from '../../Static/img/icon/payments/litecoin.svg';
import iconEthereum from '../../Static/img/icon/payments/ethereum.svg';
import iconTron from '../../Static/img/icon/payments/tron.svg';
import iconTon from '../../Static/img/icon/payments/toncoin.svg';
import iconBnb from '../../Static/img/icon/payments/bnb.svg';
import iconUnionPay from '../../Static/img/icon/payments/unionpay.svg';
import iconSberPay from '../../Static/img/icon/payments/sberpay.svg';

export const freekassaIcons = [
    iconSBP,
    iconVisa,
    iconMastercard,
    iconMir,
    iconSteam,
    iconBitcoin,
    iconLitecoin,
    iconEthereum,
    iconTron,
    iconTon,
    iconBnb,
    iconTron,
];

export const ckassaIcons = [
    iconSBP,
    iconSberPay,
    iconVisa,
    iconMastercard,
    iconMir,
    iconUnionPay,
];

interface Props {
    system: string | null;
    className?: string;
    freekassaExtra?: React.ReactNode;
}

const PaymentSystemInfo: React.FC<Props> = ({system, className, freekassaExtra}) => {
    const {t} = useTranslation();
    return (
        <>
            <Collapse in={system === 'freekassa'} className={className}>
                {freekassaExtra}
                <PaymentSystemIcons icons={freekassaIcons}/>
            </Collapse>
            <Collapse in={system === 'ckassa'} className={className}>
                <PaymentSystemIcons icons={ckassaIcons}/>
            </Collapse>
            <Collapse in={system === 'handmade'} className={className}>
                <FR opacity={80} mb={0.5} fontSize={'.88rem'}>
                    {t('handmade_payment_desc')}
                </FR>
            </Collapse>
            <Collapse in={system === 'balance'} className={className}>
                <FR opacity={80} mb={0.5} fontSize={'.88rem'}>
                    {t('balance_payment_desc')}
                </FR>
            </Collapse>
        </>
    );
};

export default PaymentSystemInfo;
