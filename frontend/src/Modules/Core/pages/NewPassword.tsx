// Modules/Core/pages/NewPassword.tsx
import React from 'react';
import {useNavigate} from "Utils/nextRouter";
import {Message} from "Core/components/Message";
import NewPasswordForm from "Auth/forms/NewPasswordForm";
import {useTranslation} from 'react-i18next';

const NewPassword = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const onSuccess = () => {
        navigate('/profile')
        Message.success(t('password_changed'));
    }
    return (
        <div className={'fccc gap-2 maxw-400px mx-auto'}>
            <h1 className={'fs-2 m-0'}>{t('new_password')}</h1>
            <NewPasswordForm onSuccess={onSuccess}/>
        </div>
    );
};

export default NewPassword;
