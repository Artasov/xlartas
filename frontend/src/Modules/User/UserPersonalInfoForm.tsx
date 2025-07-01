// Modules/User/UserPersonalInfoForm.tsx

import React, {FormEvent, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {Button, Typography, useMediaQuery} from '@mui/material';
import {SelectChangeEvent} from '@mui/material/Select';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {Message} from "Core/components/Message";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import NewEmailForm from "Auth/forms/NewEmailForm";
import SocialOAuth from "Auth/Social/components/SocialOAuth";
import {useTheme} from "Theme/ThemeContext";
import {FC, FR, FRC, FRSC} from "wide-containers";
import NewPasswordForm from "Auth/forms/NewPasswordForm";
import copyToClipboard from "Utils/clipboard";
import {useApi} from "../Api/useApi";
import UserPrivilege from "../xLMine/Privilege/UserPrivilege";
import TextField from "@mui/material/TextField";
import UserBalance from "Order/UserBalance";

interface FormData {
    username: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    gender?: 'male' | 'female';
    birth_date: string | null;
    timezone?: string;
    date_joined: string;
}

const UserPersonalInfoForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const {isAuthenticated, user, updateCurrentUser} = useContext(AuthContext) as AuthContextType;
    const {notAuthentication} = useErrorProcessing();
    const {plt} = useTheme();
    const {t} = useTranslation();
    const {api} = useApi();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!isAuthenticated || user === null) {
            notAuthentication();
            return;
        }
        setFormData({
            username: user.username || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            middle_name: user.middle_name || '',
            gender: user.gender || 'male',
            birth_date: user.birth_date || null,
            timezone: user.timezone || '',
            date_joined: user.date_joined || ''
        });
    }, [user, isAuthenticated, notAuthentication]);

    const handleChange = (
        e: | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent
            | React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value} = e.target as HTMLInputElement & { name: string; value: string };
        if (name && formData) {
            setFormData({...formData, [name as keyof FormData]: value});
            setShowSaveButton(true);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Предотвращение повторной отправки
        setIsSubmitting(true); // Установка состояния отправки

        const dataToSubmit = {...formData};
        if (!formData?.birth_date || formData?.birth_date.trim() === '') {
            delete dataToSubmit.birth_date;
        }

        api.patch('/api/v1/user/update/', dataToSubmit).then(() => {
            setShowSaveButton(false);
            updateCurrentUser().then(
                () => Message.success(t('user_update_success'))
            );
        }).finally(() => setIsSubmitting(false)); // Сброс состояния отправки
    };

    if (!formData) return null;
    if (!user) return null;

    return (
        <FC component={'form'} pb={'5rem'} pos={'relative'} mt={1} onSubmit={handleSubmit} maxW={400}>
            <FR wrap g={1} mb={1}>
                <SocialOAuth className={'pe-2'}/>
                <FC>
                    {user?.is_email_confirmed
                        ? <FR g={1}>
                            <CheckCircleOutlineIcon style={{
                                color: plt.success.main,
                                width: '1.2rem',
                            }}/>
                            <span>{t('email_confirmed_short')}</span>
                        </FR>
                        : <FR g={1}>
                            <HighlightOffIcon style={{
                                color: plt.error.main,
                                width: '1.2rem',
                            }}/>
                            <span>{t('email_not_confirmed')}</span>
                        </FR>
                    }
                    {user?.is_phone_confirmed
                        ? <FR g={1}>
                            <CheckCircleOutlineIcon style={{
                                color: plt.success.main,
                                width: '1.2rem',
                            }}/>
                            <span>{t('phone_confirmed_short')}</span>
                        </FR>
                        : <FR g={1}>
                            <HighlightOffIcon style={{
                                color: plt.error.main,
                                width: '1.2rem',
                            }}/>
                            <span>{t('phone_not_confirmed')}</span>
                        </FR>
                    }
                </FC>

            </FR>
            <FC mb={1}>
                <FRSC wrap g={1}>
                    <FR color={plt.text.primary} fontWeight={'bold'}
                        fontSize={isGtSm ? '2.2rem' : '1.7rem'}
                        lineHeight={'1.8rem'} sx={{
                        userSelect: 'all'
                    }}>
                        {user?.username}
                    </FR>
                    <FR mt={.57} lineHeight={'1.5rem'}
                        fontSize={isGtSm ? '1.7rem' : '1.5rem'}
                        fontWeight={'bold'}><UserPrivilege/></FR>
                </FRSC>
                <UserBalance/>
            </FC>
            <FC mt={1} g={2} cls={'user-form'}>
                {user.secret_key &&
                    <FC pEvents={true} onClick={() => {
                        if (user.secret_key) copyToClipboard(user.secret_key)
                    }}>
                        <FC pEvents={false}>
                            <TextField
                                fullWidth
                                type={'password'}
                                variant="outlined"
                                margin="none"
                                disabled={true}
                                size={'small'}
                                label="Secret key"
                                value={user.secret_key}/>
                        </FC>
                    </FC>}
                <FRSC g={1} maxW={'400px'}>
                    <TextField
                        variant="outlined"
                        label="Почта"
                        name="email"
                        size={'small'}
                        value={user?.email}
                        onChange={handleChange}
                        className={'flex-grow-1'}
                        disabled={true}
                        margin="none"/>
                    {user?.is_email_confirmed
                        ? <EditIcon onClick={() => setIsEmailModalOpen(true)}
                                    style={{cursor: 'pointer', color: plt.text.primary}}/>
                        : <Button onClick={() => setIsEmailModalOpen(true)}
                                  sx={{
                                      fontWeight: 500, minWidth: 130
                                  }}>{user?.email ? 'ПОДТВЕРДИТЬ' : 'ДОБАВИТЬ'}</Button>
                    }
                    <Dialog open={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)}>
                        <DialogContent>
                            <NewEmailForm onSuccess={() => setIsEmailModalOpen(false)}/>
                        </DialogContent>
                    </Dialog>
                </FRSC>
            </FC>
            <FR g={1} mt={1}>
                <Button onClick={() => setIsPasswordModalOpen(true)}
                        style={{
                            fontSize: '.7rem',
                            fontWeight: 600,
                            opacity: '70%',
                            color: plt.text.contrast70,
                        }}>
                    {t('change_password')}
                </Button>
            </FR>
            <FC mt={1}>
                <Typography fontSize={'.8rem'} color={plt.text.primary}>
                    {t('registration_date')} {format(new Date(formData.date_joined), 'dd-MM-yyyy')}
                </Typography>
            </FC>
            {showSaveButton && (
                <FRC pos={'absolute'} w={'100%'} bottom={'1rem'} left={0}>
                    <Button
                        className={'w-min minw-340px fw-6 fs-5'}
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting} // Отключение кнопки при отправке
                    >
                        {isSubmitting ? t('saving') : t('save')}
                    </Button>
                </FRC>
            )}
            <Dialog open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
                <DialogTitle>{t('change_password')}</DialogTitle>
                <DialogContent className={'px-3'}>
                    <NewPasswordForm onSuccess={() => setIsPasswordModalOpen(false)}/>
                </DialogContent>
            </Dialog>
        </FC>
    );
};

export default UserPersonalInfoForm;
