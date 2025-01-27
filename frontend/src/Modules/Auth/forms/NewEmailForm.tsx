// Auth/forms/NewEmailForm.tsx
import React, {ChangeEvent, useContext, useState} from 'react';
import TextField from '@mui/material/TextField';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {Message} from "Core/components/Message";
import {FC} from "WideLayout/Layouts";
import Button from "Core/components/elements/Button/Button";
import ConfirmationCode from "Confirmation/ConfirmationCode";

interface NewEmailFormProps {
    onSuccess: () => void;
}

const NewEmailForm: React.FC<NewEmailFormProps> = ({onSuccess}) => {
    const [showConfirmationCode, setShowConfirmationCode] = useState<boolean>(false);
    const {user} = useContext(AuthContext) as AuthContextType;
    const [email, setEmail] = useState<string>(
        (user?.email && !user.is_email_confirmed) ? user.email : ''
    );

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSendCode = () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            Message.error('Введите корректный адрес электронной почты');
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
                        Message.success('Почта успешно подтверждена');
                        onSuccess();
                    }}
                />
            }
        </FC>
    );
};

export default NewEmailForm;
