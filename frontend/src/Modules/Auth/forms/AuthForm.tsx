// Modules/Auth/forms/AuthForm.tsx
"use client";

import React, {ChangeEvent, useEffect, useState} from 'react';
import {useAuth} from 'Auth/AuthContext';
import 'react-phone-input-2/lib/material.css'
import 'Core/components/elements/PhoneField/PhoneField.sass';
import SocialOAuth from "Auth/Social/components/SocialOAuth";
import {useLocation} from 'Utils/nextRouter';
import TextField from "@mui/material/TextField";
import pprint from "Utils/pprint";
import ConfirmationCode, {ConfirmationMethod} from "Confirmation/ConfirmationCode";
import {Button, Tab, Tabs} from "@mui/material";
import PhoneField from "Core/components/elements/PhoneField/PhoneField";
import {FC, FCC} from "wide-containers";
import {Message} from "Core/components/Message";
import {isEmail, isPhone} from "Utils/validator/base";
import SignUpForm from "Auth/forms/SignUpForm";
import BackButton from "Core/components/BackButton";
import {useAuthApi} from 'Auth/useAuthApi';
import {useTranslation} from "react-i18next";

type AuthFormProps = {
    ways?: string[];
};

const AuthForm: React.FC<AuthFormProps> = ({ways = ['phone']}) => {
    const hasPhone = ways.includes('phone');
    const hasEmail = ways.includes('email');
    const hasSocial = ways.includes('social');
    const hasPasswordWay = ways.includes('password');
    const {t} = useTranslation();

    const {isAuthenticated, login, handleAuthResponse} = useAuth();
    const location = useLocation();
    const [credential, setCredential] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);  // 1 - Enter credential, 2 - Choose login method, 3 - SignUpForm, 4 - ConfirmationCode
    const [password, setPassword] = useState<string>('');
    const [selectedTab, setSelectedTab] = useState<number>(0);  // 0 - Phone, 1 - Email
    const [isValidCredential, setIsValidCredential] = useState<boolean>(false);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(false);
    const [isPhoneConfirmed, setIsPhoneConfirmed] = useState<boolean>(false);
    const [isPasswordExists, setIsPasswordExists] = useState<boolean>(false);
    const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod | null>(null);
    const [useConfirmation, setUseConfirmation] = useState<boolean>(false);
    const [confirmationAction, setConfirmationAction] = useState<string>('auth'); // 'auth' or 'signup'
    const [initialCodeSent, setInitialCodeSent] = useState<boolean>(false);
    const {getAuthMethods} = useAuthApi();

    useEffect(() => {
        if (!hasPhone && hasEmail) setSelectedTab(1);
        else setSelectedTab(0);
    }, [hasPhone, hasEmail]);

    const handlePasswordLogin = () => {
        setLoading(true);
        const next = `${location.pathname}${location.search}`;
        login(credential, password, next)
            .then(r => setLoading(false))
            .catch(() => setLoading(false));
    };

    const handleCredentialChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredential(e.target.value);
        validateCredential(e.target.value);
    };

    const handlePhoneChange = (value: string) => {
        setCredential(value);
        validateCredential(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidCredential) {
            handleNextStep(e).then();
        }
    };

    const validateCredential = (value: string) => {
        if (hasPhone && selectedTab === 0) {
            const isPhoneValid = isPhone(value);
            setIsValidCredential(isPhoneValid);
            if (isPhoneValid) setConfirmationMethod('phone');
        } else if (hasEmail && selectedTab === 1) {
            const isEmailValid = isEmail(value);
            setIsValidCredential(isEmailValid);
            if (isEmailValid) setConfirmationMethod('email');
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setStep(1);
        setSelectedTab(newValue);
        setCredential('');
        setIsValidCredential(false);
    };

    const handleTabKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab' && step === 1 && hasPhone && hasEmail) {
            e.preventDefault();
            setSelectedTab((prevTab) => (prevTab === 0 ? 1 : 0));
            setStep(1);
        }
    };

    const handleNextStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        getAuthMethods(credential).then(data => {
            if (data.user_not_exists) {
                setStep(3);
            } else {
                setIsEmailConfirmed(data.is_email_confirmed);
                setIsPhoneConfirmed(data.is_phone_confirmed);
                setIsPasswordExists(data.password_exists);
                if (!data.password_exists &&
                    (data.is_email_confirmed || data.is_phone_confirmed)) {
                    Message.info(
                        'Установите пароль после входа, чтобы в следующий раз была возможность войти по паролю',
                        6000
                    );
                }
                if (!data.is_email_confirmed && !data.is_phone_confirmed) {
                    setConfirmationAction('signup');
                    // setInitialCodeSent(true);
                    setStep(4);
                } else {
                    setStep(2);
                }
            }
        }).finally(() => setLoading(false));
    };

    const handleConfirmWithCode = (method: ConfirmationMethod) => {
        setConfirmationMethod(method);
        setConfirmationAction('auth');
        setUseConfirmation(true);
    };

    const handleSignupSuccess = (credential: string, confirmationMethod: ConfirmationMethod) => {
        setCredential(credential);
        setConfirmationMethod(confirmationMethod);
        setConfirmationAction('signup');
        setInitialCodeSent(true);
        setStep(4);
    };

    const onConfirmAuth = (action_result: any) => {
        pprint('onConfirmAuth', action_result);
        const next = `${location.pathname}${location.search}`;
        handleAuthResponse(action_result.result, next);
    }

    const handleResend = () => {
        setInitialCodeSent(false);
    };

    if (isAuthenticated === null) return null;

    return (
        <FC w={'100%'} onKeyDown={handleTabKeyPress}>
            {step === 1
                ? hasPhone && hasEmail
                    ? <div className={'mb-2'} style={{width: '100%'}}>
                        <Tabs value={selectedTab} onChange={handleTabChange}
                              centered variant={'fullWidth'}
                              className={'mb-2'}
                              aria-label="auth method tabs">
                            <Tab label={t('phone')}/>
                            <Tab label={t('email')}/>
                        </Tabs>
                    </div>
                    : ''
                : <BackButton onClick={() => {
                    setStep(1);
                    setUseConfirmation(false);
                }}
                />
            }

            {step === 1 && (
                <form className={`fcc gap-2 pt-3`} onSubmit={handleNextStep} noValidate>
                    {hasPhone && selectedTab === 0 && (
                        <PhoneField
                            cls={'mt-1'}
                            phone={credential}
                            onReturn={handleKeyDown}
                            onChange={handlePhoneChange}
                            disabled={false}
                        />
                    )}
                    {hasEmail && selectedTab === 1 && (
                        <TextField
                            label={t('email')}
                            variant="outlined"
                            type="email"
                            autoFocus={true}
                            value={credential}
                            onChange={handleCredentialChange}
                            fullWidth
                            className={''}
                        />
                    )}
                    <Button
                        type="submit"
                        // color={'primary'}
                        disabled={!isValidCredential || loading}
                        loading={loading}>
                        {t('next')}
                    </Button>
                </form>
            )}

            {step === 2 &&
                <FCC g={1} mt={1} pt={1}>
                    {(hasPhone && selectedTab === 0) && (
                        <PhoneField
                            cls={'mt-1'}
                            phone={credential}
                            onReturn={handleKeyDown}
                            onChange={handlePhoneChange}
                            disabled={true}
                        />
                    )}
                    {(hasEmail && selectedTab === 1) && (
                        <TextField
                            label={t('email')}
                            variant="outlined"
                            type="email"
                            value={credential}
                            onChange={handleCredentialChange}
                            fullWidth
                            disabled
                            className={'opacity-50 pointer-events-none'}
                        />
                    )}

                    {useConfirmation && confirmationMethod
                        ?
                        <ConfirmationCode
                            credential={credential}
                            confirmationMethod={confirmationMethod}
                            action={confirmationAction}
                            autoFocus={true}
                            onConfirm={onConfirmAuth}
                        />
                        : (isEmailConfirmed || isPhoneConfirmed) && <>
                        {hasPasswordWay && isPasswordExists && <>
                            <TextField
                                autoFocus={true}
                                label={t('password')}
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && password) {
                                        handlePasswordLogin();
                                    }
                                }}
                                fullWidth
                                margin="none"
                            />
                            <Button
                                // color={'primary'}
                                onClick={handlePasswordLogin}
                                loading={loading}>
                                {t('login_by_password')}
                            </Button>
                        </>}
                        {hasPhone && isPhoneConfirmed && (
                            <Button
                                // color={'primary'}
                                autoFocus={!(!hasPasswordWay || !isPasswordExists)}
                                onClick={() => handleConfirmWithCode('phone')}
                                loading={loading}>
                                {t('code_to_phone')}
                            </Button>
                        )}
                        {hasEmail && isEmailConfirmed && (
                            <Button
                                // color={'primary'}
                                onClick={() => handleConfirmWithCode('email')}
                                loading={loading}>
                                {t('code_to_email')}
                            </Button>
                        )}
                    </>
                    }
                </FCC>
            }

            {step === 3 && (
                <SignUpForm cls={'mt-3'}
                            credential={credential}
                            onSignupSuccess={handleSignupSuccess}/>
            )}

            {step === 4 && confirmationMethod && (
                <ConfirmationCode
                    className={'mt-3'}
                    credential={credential}
                    confirmationMethod={confirmationMethod}
                    action={confirmationAction}
                    initialCodeSent={initialCodeSent}
                    onConfirm={onConfirmAuth}
                    onResend={handleResend}
                />
            )}

            {hasSocial && (
                <SocialOAuth className={'frcc mt-2'}/>
            )}

        </FC>
    );
};

export default AuthForm;
