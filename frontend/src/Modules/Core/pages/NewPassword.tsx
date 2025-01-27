// Core/pages/NewPassword.tsx
import React from 'react';
import {useNavigate} from "react-router-dom";
import {Message} from "Core/components/Message";
import NewPasswordForm from "Auth/forms/NewPasswordForm";

const NewPassword = () => {
    const navigate = useNavigate();
    const onSuccess = () => {
        navigate('/profile')
        Message.success('Пароль успешно изменен');
    }
    return (
        <div className={'fccc gap-2 maxw-400px mx-auto'}>
            <h1 className={'fs-2 m-0'}>Новый пароль</h1>
            <NewPasswordForm onSuccess={onSuccess}/>
        </div>
    );
};

export default NewPassword;
