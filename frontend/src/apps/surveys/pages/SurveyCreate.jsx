import React, {useState} from 'react';
import {Button, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../core/components/auth/axiosConfig";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {useStyles} from "../../core/components/Theme/useStyles";

const SurveyCreate = () => {
    const {isAuthenticated, showLoginModal, frontendLogout} = useAuth(AuthContext);
    const [isTest, setIsTest] = useState(false);
    const [step, setStep] = useState(0); // 0 - выбор типа, 1 - заполнение информации
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [slug, setSlug] = useState('');
    const navigate = useNavigate();
    const classes = useStyles();

    const handleCreateSurvey = async () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
            return;
        }
        const surveyData = {
            title,
            description,
            slug,
            is_test: isTest,
        };
        try {
            const response = await axiosInstance.post('/api/surveys/survey/create/', surveyData);
            navigate(`/surveys/edit/${response.data.slug}/`);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleSlugChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '');
        setSlug(value);
    };

    return (
        <div className={'mt-4 mw-800px mx-auto'}>
            {step === 0 ? (
                <div className={'welcome'}>
                    <h4 className={'text-center'}>Что вы хотите создать?</h4>
                    <div className={'frc gap-3'}>
                        <Button
                            className={`${classes.textContrast95} ${classes.bgContrast85} mt-3 fs-5 pt-2px ps-3px`}
                            onClick={() => {
                                if (!isAuthenticated) {
                                    showLoginModal();
                                } else {
                                    setIsTest(false);
                                    setStep(1);
                                }
                            }}>
                            Опрос
                        </Button>
                        <Button
                            className={`${classes.textContrast95} ${classes.bgContrast85} mt-3 fs-5 pt-2px ps-3px`}
                            onClick={() => {
                                if (!isAuthenticated) {
                                    showLoginModal();
                                } else {
                                    setIsTest(true);
                                    setStep(1);
                                }
                            }}>
                            Тест
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={'fc gap-3'}>
                    <h4 className={'m-0'}>{isTest ? "Создание теста" : "Создание опроса"}</h4>
                    <TextField
                        label="Название"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="Слаг (название для ссылки)"
                        value={slug}
                        onChange={handleSlugChange}
                    />
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} w-min`}
                        onClick={handleCreateSurvey}>
                        Создать
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SurveyCreate;
