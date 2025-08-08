// Modules/Auth/forms/NewEmailForm.tsx
"use client";
import React, {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextField from '@mui/material/TextField';
import {useAuth} from "Auth/AuthContext";
import {Message} from "Core/components/Message";
import {FC} from "wide-containers";
import {Button} from "@mui/material";
import ConfirmationCode from "Confirmation/ConfirmationCode";

interface NewEmailFormProps {
    onSuccess: () => void;
}

const NewEmailForm: React.FC<NewEmailFormProps> = ({onSuccess}) => {
    const [showConfirmationCode, setShowConfirmationCode] = useState<boolean>(false);
    const {user} = useAuth();
    const {t} = useTranslation();
    const [email, setEmail] = useState<string>(
        (user?.email && !user.is_email_confirmed) ? user.email : ''
    );

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSendCode = () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            Message.error(t('invalid_email_address'));
            return;
        }
        setShowConfirmationCode(true);
    };

    return (
        <FC w={'100%'}>
            {!showConfirmationCode
                ? <>
                    <TextField
                        label={`${user?.is_email_confirmed
                            ? 'Новая почта'
                            : user?.email
                                ? 'Подтверждение почты'
                                : 'Добавление почты'
                        }`}
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        fullWidth
                        autoFocus
                    />
                    <Button className={'mt-2'} onClick={handleSendCode}>
                        Отправить код на почту
                    </Button>
                </>
                : <ConfirmationCode
                    credential={email}
                    confirmationMethod="email"
                    action="new_email"
                    disableCaptcha={true}
                    autoFocus={true}
                    additional_params={{new_email: email}}
                    onConfirm={() => {
                        if (user) {
                            user.email = email;
                            user.is_email_confirmed = true;
                        }
                        Message.success(t('email_confirmed'));
                        onSuccess();
                    }}
                />
            }
        </FC>
    );
};

export default NewEmailForm;
