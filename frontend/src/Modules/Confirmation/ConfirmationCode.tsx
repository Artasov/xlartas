// Modules/Confirmation/ConfirmationCode.tsx

import React, {useEffect, useState} from 'react';
import {TextField} from '@mui/material';
import {YANDEX_RECAPTCHA_SITE_KEY} from '../Api/axiosConfig';
import {Message} from 'Core/components/Message';
import DynamicForm from 'Core/components/elements/DynamicForm';
import {SmartCaptcha} from '@yandex/smart-captcha';
import Button from 'Core/components/elements/Button/Button';
import {useTheme} from 'Theme/ThemeContext';
import {FC, FCCC} from 'wide-containers';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {isEmail, isPhone} from 'Utils/validator/base';
import pprint from 'Utils/pprint';
import {useApi} from "../Api/useApi";

export type ConfirmationMethod = 'email' | 'phone';

interface ConfirmationCodeProps {
    credential: string;
    confirmationMethod: ConfirmationMethod;
    action: string;
    className?: string;
    onConfirm: (data: any) => void;
    onErrorGeneration?: () => void;
    onErrorConfirm?: () => void;
    onGeneratedCode?: () => void;
    additional_params?: Record<string, unknown>;
    autoSend?: boolean;
    autoFocus?: boolean;
    initialCodeSent?: boolean;
    onResend?: () => void;
    disableCaptcha?: boolean;
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = (
    {
        credential,
        confirmationMethod,
        action,
        onConfirm,
        className,
        onErrorGeneration = () => {
        },
        onErrorConfirm = () => {
        },
        onGeneratedCode = () => {
        },
        additional_params = {},
        autoSend = true,
        autoFocus = true,
        initialCodeSent = false,
        onResend = () => {
        },
        disableCaptcha = false, // Значение по умолчанию
    }) => {
    const [code, setCode] = useState<string>('');
    const [codeSent, setCodeSent] = useState<boolean>(initialCodeSent);
    const [resendTimeout, setResendTimeout] = useState<number>(0);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [resetCaptcha, setResetCaptcha] = useState<number>(0);
    const [isSending, setIsSending] = useState<boolean>(false);
    const {plt} = useTheme();
    const {api} = useApi();

    useEffect(() => {
        /**
         * Объединяем логику в одном useEffect:
         * - Если включён autoSend
         * - И код ещё не отправляли (codeSent === false)
         * - И сейчас не идёт отправка (isSending === false)
         * - И при этом либо капча отключена (disableCaptcha === true),
         *   либо капча включена и есть токен (captchaToken !== null)
         * Тогда отправляем код.
         */
        if (autoSend && !initialCodeSent && !codeSent && !isSending) {
            if (disableCaptcha || (!disableCaptcha && captchaToken)) sendNewCode().then();
        }
    }, [autoSend, initialCodeSent, codeSent, isSending, disableCaptcha, captchaToken]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (codeSent && resendTimeout > 0) {
            interval = setInterval(() => {
                setResendTimeout((prevTimeout) => prevTimeout - 1);
            }, 1000);
        }
        if (resendTimeout === 0 && interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [codeSent, resendTimeout]);

    const confirmCode = async () => {
        try {
            const data = await api.post('/api/v1/confirmation-code/confirm/', {
                code,
                credential,
                action,
                ...additional_params,
            });
            pprint('Confirm success:', data);
            onConfirm(data);
            Message.success(data.message);
        } catch (error) {
            pprint('Confirm error: ', error);
            onErrorConfirm();
        }
    };

    const sendNewCode = async () => {
        if (isSending) return;
        if (!disableCaptcha && !captchaToken && !initialCodeSent) {
            Message.error('Пожалуйста, пройдите капчу');
            handleResetCaptcha();
            return;
        }
        setIsSending(true);
        try {
            const payload = disableCaptcha || initialCodeSent
                ? {
                    action,
                    credential,
                    confirmationMethod,
                    ...additional_params,
                }
                : {
                    action,
                    credential,
                    confirmationMethod,
                    captchaToken,
                    ...additional_params,
                };
            const endpoint = initialCodeSent
                ? '/api/v1/confirmation-code/resend/'
                : '/api/v1/confirmation-code/new/';
            const data = await api.post(endpoint, payload);
            if (onGeneratedCode) onGeneratedCode();
            setResendTimeout(60);
            setCodeSent(true);
            Message.success(data.message, 0, 8000);
        } catch (error) {
            onErrorGeneration();
            if (!disableCaptcha) handleResetCaptcha();
        } finally {
            setIsSending(false);
        }
    };

    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };

    const handleResend = () => {
        onResend();
        setIsSending(false);
        setCodeSent(false);
        if (disableCaptcha) sendNewCode().then();
    };

    return (
        <div className={className}>
            {!codeSent ? (
                <FC g={1} pos="relative">
                    {!initialCodeSent && !disableCaptcha && (
                        <>
                            <FCCC w="100%" h="100%" pos="absolute" top={0} left={0}>
                                <CircularProgress size="3rem"/>
                            </FCCC>
                            <SmartCaptcha
                                sitekey={YANDEX_RECAPTCHA_SITE_KEY}
                                key={resetCaptcha}
                                onSuccess={setCaptchaToken}
                            />
                            {!autoSend && captchaToken && (
                                <Button onClick={sendNewCode} className="mt-2" disabled={isSending}>
                                    {isSending ? 'Отправка...' : 'Отправить код'}
                                </Button>
                            )}
                        </>
                    )}
                    {(initialCodeSent || disableCaptcha) && (
                        <Button onClick={sendNewCode} className="mt-2" disabled={isSending}>
                            {isSending ? 'Отправка...' : 'Отправить код'}
                        </Button>
                    )}
                </FC>
            ) : (
                <DynamicForm
                    requestFunc={confirmCode}
                    submitBtnText="Подтвердить"
                    submitBtnClassName="mt-2"
                >
                    <TextField
                        name="confirmation_code"
                        label="Код подтверждения"
                        variant="outlined"
                        autoFocus={autoFocus}
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="m-0"
                        fullWidth
                        margin="dense"
                        helperText={`Введите код подтверждения, отправленный на ${
                            confirmationMethod === 'email'
                                ? 'почту'
                                : 'телефон'
                        } ${
                            confirmationMethod === 'email' && isEmail(credential)
                                ? `${credential.slice(0, 2)}*****${credential.slice(
                                    credential.length - 4
                                )}.`
                                : confirmationMethod === 'phone' && isPhone(credential)
                                    ? `+${credential.slice(0, 2)}******${credential.slice(
                                        credential.length - 4
                                    )}.`
                                    : ''
                        }
                        `}
                    />
                    <div>
                        {resendTimeout > 0 ? (
                            <p
                                className="fs-7 mt-1 text-right"
                                style={{color: plt.text.primary55}}
                            >
                                {`Отправить код повторно можно через ${resendTimeout} секунд`}
                            </p>
                        ) : (
                            <p
                                onClick={handleResend}
                                className="fs-6 text-right"
                                style={{
                                    color: plt.text.primary80,
                                    cursor: 'pointer',
                                }}
                            >
                                Отправить повторно
                            </p>
                        )}
                    </div>
                </DynamicForm>
            )}
        </div>
    );
};

export default ConfirmationCode;
