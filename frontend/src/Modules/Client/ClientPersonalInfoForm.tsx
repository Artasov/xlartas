// Modules/Client/ClientPersonalInfoForm.tsx
"use client";
import React, {ChangeEvent, FormEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useAuth} from "Auth/AuthContext";
import {FC} from "wide-containers";
import {Message} from "Core/components/Message";
import TextField from "@mui/material/TextField";
import {Button} from "@mui/material";
import {useClientApi} from 'Client/useClientApi';

interface FormData {
    about_me: string;
}

const ClientPersonalInfoForm: React.FC = () => {
    const {user} = useAuth();

    const [formData, setFormData] = useState<FormData>({
        about_me: user?.client?.about_me || '',
    });

    const {updateClient} = useClientApi();
    const {t} = useTranslation();
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        setShowSaveButton(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        updateClient(formData as any).then(() => {
            Message.success(t('client_update_success'));
            setShowSaveButton(false);
        }).finally(() => setIsSubmitting(false));
    };

    return (
        <FC component="form" maxW={400} onSubmit={handleSubmit}>
            <TextField
                variant="standard"
                label="Обо мне"
                name="about_me"
                value={formData.about_me}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            {showSaveButton && (
                <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting} // Отключаем кнопку при отправке формы
                >
                    {isSubmitting ? t('saving') : t('save')}
                </Button>
            )}
        </FC>
    );
};

export default ClientPersonalInfoForm;
