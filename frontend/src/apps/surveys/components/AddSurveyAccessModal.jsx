import React, {useState} from 'react';
import {Button, TextField} from '@mui/material';
import axiosInstance, {YANDEX_RECAPTCHA_SITE_KEY} from '../../core/components/auth/axiosConfig';
import {Message} from '../../core/components/Message';
import {ErrorProcessing} from '../../core/components/ErrorProcessing';
import {useStyles} from "../../core/components/Theme/useStyles";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import {SmartCaptcha} from "@yandex/smart-captcha";

const AddSurveyAccessModal = ({surveyId, onClose, onAccessAdded, setIsAccessEditModalOpen}) => {
    const {frontendLogout} = useAuth(AuthContext);
    const [email, setEmail] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const [resetCaptcha, setResetCaptcha] = useState(0);
    const classes = useStyles();

    const handleAddAccess = async () => {
        try {
            await axiosInstance.post('/api/surveys/survey_access/create/', {
                survey: surveyId, email: email, captchaToken: captchaToken
            });
            Message.success('Access added successfully.');
            onClose();
            onAccessAdded();
            setIsAccessEditModalOpen(true);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
            handleResetCaptcha();
        }
    };
    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };
    return (
        <div className={'fc gap-2'}>
            <h5>Добавить доступ</h5>
            <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <SmartCaptcha sitekey={YANDEX_RECAPTCHA_SITE_KEY}
                          key={resetCaptcha} onSuccess={setCaptchaToken}/>
            <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                    onClick={handleAddAccess}>
                Сохранить
            </Button>
        </div>
    );
};

export default AddSurveyAccessModal;
