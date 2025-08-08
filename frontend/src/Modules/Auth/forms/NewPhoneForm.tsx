// Modules/Auth/forms/NewPhoneForm.tsx
"use client";
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import PhoneField from "Core/components/elements/PhoneField/PhoneField";
import {Button} from '@mui/material';
import ConfirmationCode from 'Confirmation/ConfirmationCode';
import {Message} from "Core/components/Message";
import {useAuth} from "Auth/AuthContext";

interface NewPhoneFormProps {
    onSuccess: () => void;
}

const NewPhoneForm: React.FC<NewPhoneFormProps> = ({onSuccess}) => {
    const [phone, setPhone] = useState<string>('');
    const [showConfirmationCode, setShowConfirmationCode] = useState<boolean>(false);
    const {user} = useAuth();
    const {t} = useTranslation();

    const handlePhoneChange = (value: string) => {
        setPhone(value);
    };

    const handleSendCode = () => {
        if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
            Message.error(t('invalid_phone_number'));
            return;
        }
        setShowConfirmationCode(true);
    };

    return (
        <div className="fc w-100">
            {!showConfirmationCode
                ? <>
                    <PhoneField
                        phone={phone}
                        onChange={handlePhoneChange}
                        disabled={false}
                        onReturn={handleSendCode}/>
                    <Button className={'mt-2'} onClick={handleSendCode}>
                        Отправить код на телефон
                    </Button>
                </>
                : <ConfirmationCode
                    credential={phone}
                    confirmationMethod="phone"
                    action="new_phone"
                    autoFocus={true}
                    additional_params={{new_phone: phone}}
                    onConfirm={() => {
                        if (user) {
                            user.phone = phone;
                            user.is_phone_confirmed = true;
                        }
                        Message.success(t('phone_confirmed'));
                        onSuccess();
                    }}
                />
            }
        </div>
    );
};

export default NewPhoneForm;
