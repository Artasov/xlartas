// Client/ClientPersonalInfoForm.tsx
import React, {ChangeEvent, FormEvent, useContext, useState} from 'react';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {axios} from "Auth/axiosConfig";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {FC} from "WideLayout/Layouts";
import {Message} from "Core/components/Message";
import TextField from "Core/components/elements/TextField/TextField";
import Button from "Core/components/elements/Button/Button";

interface FormData {
    about_me: string;
}

const ClientPersonalInfoForm: React.FC = () => {
    const {byResponse} = useErrorProcessing();
    const {user} = useContext(AuthContext) as AuthContextType;

    const [formData, setFormData] = useState<FormData>({
        about_me: user?.client?.about_me || '',
    });

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
        axios.patch('/api/v1/client/update/', formData)
            .then(() => {
                Message.success('Клиент успешно обновлен.');
                setShowSaveButton(false);
            })
            .catch((e) => byResponse(e))
            .finally(() => setIsSubmitting(false)); // Завершаем submit независимо от успеха или ошибки
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
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            )}
        </FC>
    );
};

export default ClientPersonalInfoForm;
