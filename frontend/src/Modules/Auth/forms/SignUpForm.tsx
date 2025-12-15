// Modules/Auth/forms/SignUpForm.tsx
"use client";
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import ConfirmationCode, {ConfirmationMethod} from 'Confirmation/ConfirmationCode';
import {Message} from 'Core/components/Message';
import PhoneField from 'Core/components/elements/PhoneField/PhoneField';
import TextField from '@mui/material/TextField';
import {SmartCaptcha} from '@yandex/smart-captcha';
import {Button} from '@mui/material';
import {isEmail, isPhone} from 'Utils/validator/base';
import {FC, FCCC} from 'wide-containers';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import TermsCheckboxes from "Core/components/TermsCheckboxes";
import {useTheme} from "Theme/ThemeContext";
import {debounce} from 'lodash';
import {YANDEX_RECAPTCHA_SITE_KEY} from "Api/axiosConfig";
import pprint from "Utils/pprint";
import {useAuthApi} from 'Auth/useAuthApi';

interface SignUpFormProps {
    credential: string;
    cls?: string;
    mode?: 'phone' | 'email';
    onSignupSuccess: (credential: string, confirmationMethod: ConfirmationMethod) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = (
    {
        credential,
        onSignupSuccess,
        cls,
        mode = 'email'
    }) => {
    const [phone, setPhone] = useState<string>(mode === 'phone' && isPhone(credential) ? credential : '');
    const [email, setEmail] = useState<string>(mode === 'email' && isEmail(credential) ? credential : '');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [resetCaptcha, setResetCaptcha] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const {plt} = useTheme();
    const {t} = useTranslation();

    const [firstChecked, setFirstChecked] = useState<boolean>(false);
    const [secondChecked, setSecondChecked] = useState<boolean>(false);

    const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);
    const [isPhoneAvailable, setIsPhoneAvailable] = useState<boolean>(true);
    const [phoneTouched, setPhoneTouched] = useState<boolean>(false);

    const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean>(true);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);

    const phoneCheckRef = useRef<ReturnType<typeof debounce> | null>(null);
    const emailCheckRef = useRef<ReturnType<typeof debounce> | null>(null);

    const [confirmationSent, setConfirmationSent] = useState<boolean>(false);
    const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod | null>(null);

    const [initialCodeSent, setInitialCodeSent] = useState<boolean>(false);

    const {checkPhoneExists, checkEmailExists, signup} = useAuthApi();

    useEffect(() => {
        pprint('credential');
        pprint(credential);
        if (mode === 'phone') {
            if (isPhone(credential)) {
                setPhone(credential);
            }
        } else {
            if (isEmail(credential)) {
                setEmail(credential);
            }
        }
    }, [credential, mode]);

    useEffect(() => {
        if (mode === 'phone' && phoneTouched) {
            const valid = isPhone(phone);
            setIsPhoneValid(valid);
            setIsPhoneAvailable(true);
            if (phoneCheckRef.current) phoneCheckRef.current.cancel();
            if (valid) {
                phoneCheckRef.current = debounce(async () => {
                    checkPhoneExists(phone).then(
                        data => setIsPhoneAvailable(!data.exists)
                    );
                }, 500);
                phoneCheckRef.current();
            }
            return () => {
                if (phoneCheckRef.current) phoneCheckRef.current.cancel();
            };
        }
    }, [phone, phoneTouched, mode]);

    useEffect(() => {
        if (mode === 'email' && emailTouched) {
            const valid = isEmail(email);
            setIsEmailValid(valid);
            setIsEmailAvailable(true);
            if (emailCheckRef.current) emailCheckRef.current.cancel();
            if (valid) {
                emailCheckRef.current = debounce(async () => {
                    checkEmailExists(email).then(
                        data => setIsEmailAvailable(!data.exists)
                    );
                }, 500);
                emailCheckRef.current();
            }
            return () => {
                if (emailCheckRef.current) emailCheckRef.current.cancel();
            };
        }
    }, [email, emailTouched, mode]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const submitEvent = e.nativeEvent as SubmitEvent & { submitter?: HTMLElement };
        const button = submitEvent.submitter as HTMLButtonElement | undefined;
        const confirmationMethodSelected: ConfirmationMethod | undefined = button?.value as ConfirmationMethod | undefined;
        if (!confirmationMethodSelected) {
            Message.error(t('select_confirmation_method'));
            return;
        }
        setIsSubmitting(true);
        const timeZone = localStorage.getItem('timeZone');
        const data: any = {
            captchaToken,
            agree_terms: firstChecked,
            agree_newsletters: secondChecked,
            ...(timeZone && {timezone: timeZone}),
        };
        if (mode === 'phone') data.phone = phone || null;
        else data.email = email || null;

        signup(data).then(data => {
            Message.success(data.message);
            if (data.confirmation_sent) {
                setConfirmationSent(true);
                setConfirmationMethod(data.confirmation_method);
                setInitialCodeSent(true);
            }
            const credentialValue = mode === 'email' ? email : phone;
            onSignupSuccess(credentialValue!, confirmationMethodSelected);
        }).catch(_ => handleResetCaptcha()).finally(() => setIsSubmitting(false));
    };
    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };
    const isFormValid = () => {
        if (mode === 'phone') {
            return isPhoneValid && isPhoneAvailable &&
                firstChecked &&
                (confirmationSent || captchaToken);
        } else {
            return isEmailValid && isEmailAvailable &&
                firstChecked &&
                (confirmationSent || captchaToken);
        }
    };
    const handleConfirm = (data: any) => Message.success(t('account_confirmed'));
    const handleResend = () => setInitialCodeSent(false);

    return (
        <div className={`${cls} fcc`}>
            {!confirmationSent ? (
                <form className={`fcc gap-2 pt-2`} onSubmit={handleSubmit} noValidate>
                    {mode === 'phone' ? (
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
                    ) : (
                        <FC g={'.8rem'}>
                            <TextField
                                autoFocus={!(isEmail(credential))}
                                label="Почта"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailTouched(true);
                                }}
                                fullWidth
                                error={(!isEmailAvailable && isEmailValid) || (!isEmailValid && email.trim().length > 0)}
                                helperText={(!isEmailAvailable && isEmailValid)
                                    ? 'Email уже используется'
                                    : (!isEmailValid && email.trim().length > 0)
                                        ? 'Некорректный email'
                                        : undefined}
                            />
                        </FC>
                    )}
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
                                <CircularProgressZoomify in size={'3rem'}/>
                            </FCCC>
                            <FC sx={{
                                transformOrigin: '0 0', width: '100%',
                                filter: plt.mode === 'dark' ? 'invert(.87) hue-rotate(180deg)' : 'none',
                            }}>
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
                            type="submit"
                            name="confirmationMethod"
                            value={mode}
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
                    credential={mode === 'phone' ? phone : email}
                    confirmationMethod={confirmationMethod}
                    action={'signup'}
                    initialCodeSent={initialCodeSent}
                    onConfirm={handleConfirm}
                    onResend={handleResend}
                />
            )}
        </div>
    )
};

export default SignUpForm;
