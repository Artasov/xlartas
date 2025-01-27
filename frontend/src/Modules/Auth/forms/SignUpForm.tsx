// Auth/forms/SignUpForm.tsx
import React, {useEffect, useRef, useState} from 'react';
import ConfirmationCode, {ConfirmationMethod} from 'Confirmation/ConfirmationCode';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import {Message} from 'Core/components/Message';
import PhoneField from 'Core/components/elements/PhoneField/PhoneField';
import {SmartCaptcha} from '@yandex/smart-captcha';
import Button from 'Core/components/elements/Button/Button';
import {isPhone} from 'Utils/validator/base';
import {FC, FCCC} from 'WideLayout/Layouts';
import CircularProgress from 'Core/components/elements/CircularProgress';
import TermsCheckboxes from "Core/components/TermsCheckboxes";
import {useTheme} from "Theme/ThemeContext";
import {debounce} from 'lodash';
import 'Core/components/elements/PhoneField/PhoneField.sass';
import {axios, YANDEX_RECAPTCHA_SITE_KEY} from "Auth/axiosConfig";
import pprint from "Utils/pprint";

interface SignUpFormProps {
    credential: string;
    className?: string;
    onSignupSuccess: (credential: string, confirmationMethod: ConfirmationMethod) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({credential, onSignupSuccess, className}) => {
    const {byResponse} = useErrorProcessing();
    const [phone, setPhone] = useState<string>(isPhone(credential) ? credential : '');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [resetCaptcha, setResetCaptcha] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const {theme} = useTheme();

    const [firstChecked, setFirstChecked] = useState<boolean>(false);
    const [secondChecked, setSecondChecked] = useState<boolean>(false);

    const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);
    const [isPhoneAvailable, setIsPhoneAvailable] = useState<boolean>(true);

    const [phoneTouched, setPhoneTouched] = useState<boolean>(false);

    const phoneCheckRef = useRef<ReturnType<typeof debounce> | null>(null);

    const [confirmationSent, setConfirmationSent] = useState<boolean>(false);
    const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod | null>(null);

    const [initialCodeSent, setInitialCodeSent] = useState<boolean>(false); // Новое состояние

    useEffect(() => {
        pprint('credential');
        pprint(credential);
        if (isPhone(credential)) {
            setPhone(credential);
        }
    }, [credential]);

    useEffect(() => {
        if (phoneTouched) {
            const valid = isPhone(phone);
            setIsPhoneValid(valid);
            setIsPhoneAvailable(true);

            if (phoneCheckRef.current) {
                phoneCheckRef.current.cancel();
            }

            if (valid) {
                phoneCheckRef.current = debounce(async () => {
                    try {
                        const response = await axios.post('/api/v1/check-phone-exists/', {phone});
                        setIsPhoneAvailable(!response.data.exists);
                    } catch (error) {
                        byResponse(error);
                    }
                }, 500);

                phoneCheckRef.current();
            }

            return () => {
                if (phoneCheckRef.current) {
                    phoneCheckRef.current.cancel();
                }
            };
        }
    }, [phone, byResponse, phoneTouched]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const submitEvent = e.nativeEvent as SubmitEvent & { submitter?: HTMLElement };
        const button = submitEvent.submitter as HTMLButtonElement | undefined;
        const confirmationMethodSelected: ConfirmationMethod | undefined = button?.value as ConfirmationMethod | undefined;

        if (!confirmationMethodSelected) {
            Message.error('Пожалуйста, выберите метод подтверждения');
            return;
        }

        setIsSubmitting(true);
        try {
            const timeZone = localStorage.getItem('timeZone');
            const data: any = {
                phone: phone || null,
                captchaToken,
                agree_terms: firstChecked,
                agree_newsletters: secondChecked,
                ...(timeZone && {timezone: timeZone}),
            };
            const response = await axios.post('/api/v1/signup/', data);
            Message.success(response.data.message);

            if (response.data.confirmation_sent) {
                setConfirmationSent(true);
                setConfirmationMethod(response.data.confirmation_method);
                setInitialCodeSent(true); // Устанавливаем initialCodeSent в true после отправки кода
            }

            const credentialValue = confirmationMethodSelected === 'email' ? phone : phone;
            onSignupSuccess(credentialValue!, confirmationMethodSelected);
        } catch (error) {
            byResponse(error);
            handleResetCaptcha();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };

    const isFormValid = () => {
        return isPhoneValid && isPhoneAvailable &&
            firstChecked &&
            (confirmationSent || captchaToken);
    };

    const handleConfirm = (data: any) => {
        // Handle успешное подтверждение
        Message.success('Ваш аккаунт успешно подтвержден!');
    };

    // Функция для обработки повторной отправки кода
    const handleResend = () => {
        setInitialCodeSent(false); // Сбрасываем initialCodeSent, чтобы показать капчу
    };

    return (
        <div className={`${className} fcc`}>
            {!confirmationSent ? (
                <form className={`fcc gap-2 pt-2`} onSubmit={handleSubmit} noValidate>
                    <FC g={'.8rem'}>
                        <PhoneField
                            autoFocus={!isPhone(credential)}
                            phone={phone}
                            onReturn={() => {
                            }}
                            onChange={(value) => {
                                setPhone(value);
                                setPhoneTouched(true);
                            }}
                            disabled={false}
                            error={(!isPhoneAvailable && isPhoneValid)
                                ? 'Телефон уже используется'
                                : (!isPhoneValid && phone.trim().length > 0)
                                    ? 'Некорректный номер телефона'
                                    : undefined}
                        />
                    </FC>
                    <TermsCheckboxes
                        cls={'mt-2px'}
                        firstChecked={firstChecked}
                        secondChecked={secondChecked}
                        onFirstCheckedChange={setFirstChecked}
                        onSecondCheckedChange={setSecondChecked}
                    />
                    {!confirmationSent && (
                        <FC pos={'relative'} cls={'mb-2'}>
                            <FCCC w={'100%'} h={'100%'} pos={'absolute'} top={0} left={0}>
                                <CircularProgress size={'3rem'}/>
                            </FCCC>
                            <FC sx={{filter: theme.palette.mode === 'dark' ? 'invert(.87) hue-rotate(180deg)' : 'none'}}>
                                <SmartCaptcha
                                    sitekey={YANDEX_RECAPTCHA_SITE_KEY}
                                    key={resetCaptcha}
                                    onSuccess={setCaptchaToken}
                                />
                            </FC>
                        </FC>
                    )}
                    <FC g={1}>
                        <Button
                            // color={'primary'}
                            type="submit"
                            name="confirmationMethod"
                            value="phone"
                            disabled={isSubmitting || !isFormValid()}
                            loading={isSubmitting}
                        >
                            Создать аккаунт
                        </Button>
                    </FC>
                </form>
            ) : confirmationMethod && (
                <ConfirmationCode
                    className={'mt-3'}
                    credential={credential}
                    confirmationMethod={confirmationMethod}
                    action={'signup'}
                    initialCodeSent={initialCodeSent} // Передаем состояние initialCodeSent
                    onConfirm={handleConfirm} // Передаем функцию обработчика подтверждения
                    onResend={handleResend} // Передаем функцию обработчика повторной отправки
                />
            )}
        </div>
    )
};

export default SignUpForm;
