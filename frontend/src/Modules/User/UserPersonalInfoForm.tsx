// User/UserPersonalInfoForm.tsx

import React, {FormEvent, useContext, useEffect, useState} from 'react';
import {format} from 'date-fns';
import {FormControlLabel, Radio, RadioGroup, Typography, useMediaQuery} from '@mui/material';
import {SelectChangeEvent} from '@mui/material/Select';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {axios} from "Auth/axiosConfig";
import TextField from "Core/components/elements/TextField/TextField";
import {Message} from "Core/components/Message";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Button from "Core/components/elements/Button/Button";

import EditIcon from '@mui/icons-material/Edit';
import Modal from "Core/components/elements/Modal/Modal";
import NewEmailForm from "Auth/forms/NewEmailForm";
import NewPhoneForm from "Auth/forms/NewPhoneForm";
import SocialOAuth from "Auth/Social/components/SocialOAuth";
import {useTheme} from "Theme/ThemeContext";
import CustomDatePicker from "Core/components/elements/CustomDatePicker";
import TimeZonePicker from "Core/components/elements/TimeZonePicker";
import {FC, FR, FRC, FRSC} from "WideLayout/Layouts";
import NewPasswordForm from "Auth/forms/NewPasswordForm";
import UserAvatarEditable from "User/UserAvatarEditable";

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
    const {byResponse, notAuthentication} = useErrorProcessing();
    const {theme} = useTheme();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
    const isLargeScreen = useMediaQuery('(min-width: 576px)');

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

        axios.patch('/api/v1/user/update/', dataToSubmit).then(() => {
            setShowSaveButton(false);
            updateCurrentUser().then(
                () => Message.success('Пользователь успешно обновлен.')
            );
        }).catch(e => byResponse(e))
            .finally(() => setIsSubmitting(false)); // Сброс состояния отправки
    };

    if (!formData) return null;

    return (
        <FC component={'form'} pb={'5rem'} pos={'relative'} mt={1} onSubmit={handleSubmit} maxW={400}>
            <FR wrap g={1} mb={2}>
                {!isLargeScreen && <UserAvatarEditable size={'8rem'}/>}
                <SocialOAuth className={'pe-2'}/>
                <FC>
                    {user?.is_email_confirmed
                        ? <div className={'fr gap-2 pe-3'}>
                            <CheckCircleOutlineIcon style={{
                                color: theme.palette.success.main,
                                width: '1.2rem',
                            }}/>
                            <span>Почта подтверждена</span>
                        </div>
                        : <div className={'fr gap-2 pe-3'}>
                            <HighlightOffIcon style={{
                                color: theme.palette.error.main,
                                width: '1.2rem',
                            }}/>
                            <span>Почта не подтверждена</span>
                        </div>
                    }
                    {user?.is_phone_confirmed
                        ? <div className={'fr gap-2 pe-3'}>
                            <CheckCircleOutlineIcon style={{
                                color: theme.palette.success.main,
                                width: '1.2rem',
                            }}/>
                            <span>Телефон подтвержден</span>
                        </div>
                        : <div className={'fr gap-2 pe-3'}>
                            <HighlightOffIcon style={{
                                color: theme.palette.error.main,
                                width: '1.2rem',
                            }}/>
                            <span>Телефон не подтвержден</span>
                        </div>
                    }
                </FC>

            </FR>

            <FC g={2} cls={'user-form'}>
                <FR g={1}>
                    <TextField
                        variant="outlined"
                        margin="none"
                        className={'flex-grow-1'}
                        label="Имя пользователя"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}/>

                    <Button onClick={() => setIsPasswordModalOpen(true)}
                            classNameOverride={`px-2 opacity-75 pb-0 pt-3px text-nowrap minw-150px`}
                            style={{
                                fontWeight: 600,
                                color: theme.palette.text.contrast70,
                            }}>
                        Сменить пароль
                    </Button>
                </FR>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="none"
                    label="Имя"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}/>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="none"
                    label="Фамилия"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}/>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="none"
                    label="Отчество"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}/>

                <FRSC g={1} maxW={'400px'}>
                    <TextField
                        variant="outlined"
                        label="Почта"
                        name="email"
                        value={user?.email}
                        onChange={handleChange}
                        className={'flex-grow-1'}
                        disabled={true}
                        margin="none"/>
                    {user?.is_email_confirmed
                        ? <EditIcon onClick={() => setIsEmailModalOpen(true)}
                                    style={{cursor: 'pointer', color: theme.palette.text.primary60}}/>
                        : <Button onClick={() => setIsEmailModalOpen(true)}
                                  sx={{
                                      fontWeight: 500, minWidth: 130
                                  }}>{user?.email ? 'ПОДТВЕРДИТЬ' : 'ДОБАВИТЬ'}</Button>
                    }
                    <Modal isOpen={isEmailModalOpen} bg={theme.palette.bg.primary}
                           onClose={() => setIsEmailModalOpen(false)}>
                        <NewEmailForm onSuccess={() => setIsEmailModalOpen(false)}/>
                    </Modal>
                </FRSC>
                <FRSC g={1} maxW={'400px'}>
                    <TextField
                        variant="outlined"
                        label="Номер телефона"
                        name="phone"
                        value={user?.phone ? `${user?.phone}` : ''}
                        onChange={handleChange}
                        className={'flex-grow-1'}
                        disabled={true}
                        margin="none"/>
                    {user?.is_phone_confirmed
                        ? <EditIcon onClick={() => setIsPhoneModalOpen(true)}
                                    style={{cursor: 'pointer', color: theme.palette.text.primary60}}/>
                        : <Button onClick={() => setIsPhoneModalOpen(true)}
                                  classNameOverride={`px-2 opacity-75 pb-0 pt-3px h-100 text-nowrap minw-150px`} sx={{
                            color: theme.palette.text.contrast70,
                            fontWeight: 600, minWidth: 130
                        }}>ПОДТВЕРДИТЬ</Button>
                    }
                    <Modal cls={'px-3'} bg={theme.palette.bg.primary} closeOnOutsideClick={false}
                           isOpen={isPhoneModalOpen}
                           onClose={() => setIsPhoneModalOpen(false)}>
                        <NewPhoneForm onSuccess={() => setIsPhoneModalOpen(false)}/>
                    </Modal>
                </FRSC>
            </FC>
            <RadioGroup
                className={'mb-1'}
                row aria-label="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}>
                <FormControlLabel
                    className={'m-0'}
                    labelPlacement="start"
                    value="male"
                    control={<Radio/>}
                    label="Мужской"/>
                <FormControlLabel
                    className={'m-0'}
                    value="female"
                    control={<Radio/>}
                    label="Женский"/>
            </RadioGroup>
            <FR wrap g={2}>
                <CustomDatePicker
                    label={'Дата рождения'}
                    value={formData.birth_date ? new Date(formData.birth_date) : null}
                    onChange={(date) => {
                        const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
                        setFormData({...formData, birth_date: formattedDate});
                        setShowSaveButton(true);
                    }}
                />
                <TimeZonePicker
                    className={'maxw-180px'}
                    value={formData.timezone || ''}
                    onChange={handleChange}
                />
            </FR>
            <Typography mt={1} fontSize={'.8rem'} color={theme.palette.text.primary30}>
                Дата регистрации {format(new Date(formData.date_joined), 'dd-MM-yyyy')}
            </Typography>


            {showSaveButton && (
                <FRC pos={'absolute'} w={'100%'} bottom={'1rem'} left={0}>
                    <Button
                        className={'w-min minw-340px fw-6 fs-5'}
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting} // Отключение кнопки при отправке
                    >
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </FRC>
            )}

            <Modal closeOnOutsideClick={false} title={'Смена пароля'}
                   isOpen={isPasswordModalOpen} cls={'px-3'}
                   onClose={() => setIsPasswordModalOpen(false)}>
                <NewPasswordForm onSuccess={() => setIsPasswordModalOpen(false)}/>
            </Modal>
        </FC>
    );
};

export default UserPersonalInfoForm;
