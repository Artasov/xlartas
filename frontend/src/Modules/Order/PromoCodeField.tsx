// Modules/Order/PromoCodeField.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import debounce from 'lodash.debounce';
import {FC} from "wide-containers";
import CircularProgress from "Core/components/elements/CircularProgress";
import {TextField} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {useTheme} from "Theme/ThemeContext";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {IPromocode} from "types/commerce/promocode";
import {ICurrency} from "types/commerce/shop";
import {Message} from "Core/components/Message";
import {useApi} from "../Api/useApi";

interface PromoCodeFieldProps {
    cls?: string;
    employeeId?: number;
    productId: number;
    currency: ICurrency;
    onValidChange?: (isValid: boolean | null, promocode?: IPromocode) => void;
    onPromoCodeChange?: (code: string) => void;
    revalidateKey?: number; // параметр для перезапуска валидации
}

const PromoCodeField: React.FC<PromoCodeFieldProps> = (
    {cls, employeeId, productId, currency, onValidChange, onPromoCodeChange, revalidateKey}
) => {
    const [promoCode, setPromoCode] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const promoCodeRef = useRef<HTMLInputElement>(null);
    const {api} = useApi();
    const {plt, theme} = useTheme();
    const {byResponse} = useErrorProcessing();
    const {t} = useTranslation();

    const checkPromoCode = debounce(async (code: string) => {
        if (!code) {
            setStatus('idle');
            if (onValidChange) onValidChange(null);
            return;
        }
        setStatus('checking');
        try {
            const response = await api.post('api/v1/promocode/applicable/', {
                promocode: code,
                employee: employeeId,
                product: productId,
                currency,
            });
            setStatus('valid');
            promoCodeRef.current && promoCodeRef.current.blur();
            if (onValidChange) onValidChange(true, response.data);
            Message.success(t('promo_code_success'));
        } catch (error) {
            byResponse(error);
            setStatus('invalid');
            if (onValidChange) onValidChange(false);
        }
    }, 2000);

    // Объединённый useEffect для promoCode и revalidateKey
    useEffect(() => {
        if (promoCode) {
            checkPromoCode(promoCode);
        } else {
            setStatus('idle');
            if (onValidChange) onValidChange(null);
        }
        return () => checkPromoCode.cancel();
    }, [promoCode, revalidateKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPromoCode(e.target.value);
        if (e.target.value) {
            setStatus('checking');
        } else {
            setStatus('idle');
            if (onValidChange) onValidChange(null);
        }
        if (onPromoCodeChange) onPromoCodeChange(e.target.value);
    };

    const getColor = () => {
        if (status === 'valid') return 'success';
        if (status === 'invalid') return 'error';
        return 'default';
    };

    return (
        <FC w={'100%'} pos={'relative'} cls={cls}>
            <TextField
                label="Промокод"
                variant={'filled'}
                value={promoCode}
                onChange={handleChange}
                fullWidth
                color={getColor() as any}
                inputRef={promoCodeRef}
            />
            {status === 'checking' && (
                <CircularProgress size={'2rem'} sx={{
                    color: theme.colors.secondary.main,
                    position: 'absolute',
                    top: 'calc(50% - 1rem)',
                    right: '10px',
                }}/>
            )}
            {status === 'valid' && (
                <CheckCircleOutlineIcon
                    style={{
                        color: theme.colors.secondary.main,
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)'
                    }}
                />
            )}
            {status === 'invalid' && (
                <HighlightOffIcon
                    style={{
                        color: theme.colors.error.main,
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)'
                    }}
                />
            )}
        </FC>
    );
};

export default PromoCodeField;
