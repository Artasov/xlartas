// Modules/Auth/forms/NewPasswordForm.tsx
import React, {useEffect, useRef, useState} from 'react';
import TextField from '@mui/material/TextField';
import {useAuth} from 'Auth/AuthContext';
import {Button, IconButton, InputAdornment} from "@mui/material";
import 'react-phone-input-2/lib/material.css';
import 'Core/components/elements/PhoneField/PhoneField.sass';
import ConfirmationCode from "Confirmation/ConfirmationCode";
import {Message} from "Core/components/Message";
import {useNavigate} from "react-router-dom";
import {useTranslation} from 'react-i18next';
import {FC} from 'wide-containers';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface NewPasswordFormProps {
    onSuccess?: () => void;
}

const NewPasswordForm: React.FC<NewPasswordFormProps> = (
    {
        onSuccess = () => {
        }
    }) => {
    const {user, isAuthenticated} = useAuth();
    const [newPassword, setNewPassword] = useState<string>('');
    const [useConfirmation, setUseConfirmation] = useState<boolean>(false);
    const [confirmationMethod, setConfirmationMethod] = useState<'email' | 'phone' | null>(null);
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuthenticated === false) {
            navigate('/');
            Message.info(
                'Войдите в аккаунт по ' +
                'адресу электронной почты, внутри профиля' +
                ' вы сможете сменить пароль.', 1, 8000);
        }
    }, [isAuthenticated, navigate]);

    const handleUseCode = (method: 'email' | 'phone') => {
        setConfirmationMethod(method);
        setUseConfirmation(true);
    };

    const handleClickShowPassword = () => {
        const input = inputRef.current;
        if (input) {
            const cursorPosition = input.selectionStart;
            setShowPassword(prev => !prev);
            setTimeout(() => {
                if (input) {
                    input.setSelectionRange(cursorPosition || 0, cursorPosition || 0);
                    input.focus();
                }
            }, 0);
        } else {
            setShowPassword(prev => !prev);
        }
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <FC g={1} w={'100%'}>
            {isAuthenticated
                ? useConfirmation
                    ? <ConfirmationCode
                        className={'mt-2'}
                        credential={confirmationMethod === 'email' ? (user?.email || '') : (user?.phone || '')}
                        confirmationMethod={confirmationMethod || 'email'}
                        action={'new_password'}
                        autoFocus={true}
                        onConfirm={(_action_result: any) => {
                            Message.success(t('password_changed'))
                            onSuccess()
                        }}
                        additional_params={{new_password: newPassword}}
                    />
                    : <>
                        <TextField
                            label={t('new_password')}
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            margin="none"
                            className={`${useConfirmation ? 'opacity-50 pointer-events-none' : ''}`}
                            disabled={useConfirmation}
                            inputRef={inputRef}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        {newPassword && (
                            <>
                                {user?.is_email_confirmed && (
                                    <Button onClick={() => handleUseCode('email')}>
                                        Подтвердить через почту
                                    </Button>
                                )}
                                {user?.is_phone_confirmed && (
                                    <Button onClick={() => handleUseCode('phone')}>
                                        Подтвердить через телефон
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                : null
            }
        </FC>
    );
};

export default NewPasswordForm;
