import React, {useEffect, useState} from 'react';
import {Button, CircularProgress, Tab, Tabs} from "@mui/material";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../core/components/auth/axiosConfig";
import {useStyles} from "../../core/components/Theme/useStyles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import Modal from "../../core/components/elements/Modal/Modal";
import {Message} from "../../core/components/Message";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import SurveyAccessEdit from "../components/SurveyAccessEdit";

const SurveysMainPage = () => {
    const {isAuthenticated, showLoginModal, user, frontendLogout} = useAuth(AuthContext);
    const [userSurveys, setUserSurveys] = useState([]);
    const [loadingUserSurveys, setLoadingUserSurveys] = useState(false);
    const [errorUserSurveys, setErrorUserSurveys] = useState('');
    const [tab, setTab] = useState(0); // 0 - Опросы, 1 - Тесты
    const [isAccessEditModalOpen, setIsAccessEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const navigate = useNavigate();
    const classes = useStyles();

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingUserSurveys(true);
            axiosInstance.get('/api/surveys/current_user/')
                .then(response => {
                    setUserSurveys(response.data);
                    setLoadingUserSurveys(false);
                })
                .catch(error => {
                    setErrorUserSurveys('Error fetching user surveys');
                    setLoadingUserSurveys(false);
                    console.error('Error fetching user surveys:', error);
                });
        }
    }, [isAuthenticated]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleDeleteSurvey = async () => {
        try {
            await axiosInstance.delete('/api/surveys/survey/delete/', {
                data: {survey_id: currentSurvey.id}
            });
            setUserSurveys(userSurveys.filter(survey => survey.id !== currentSurvey.id));
            setIsDeleteModalOpen(false);
            Message.success('Survey removed successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleOpenSlugModal = (survey) => {
        setCurrentSurvey(survey);
        setIsAccessEditModalOpen(true);
    };

    const handleOpenDeleteModal = (survey) => {
        setCurrentSurvey(survey);
        setIsDeleteModalOpen(true);
    };


    const handleSlugUpdate = (surveyId, newSlug) => {
        setUserSurveys(userSurveys.map(survey => {
            if (survey.id === surveyId) {
                return {...survey, slug: newSlug};
            }
            return survey;
        }));
    };

    if (isAuthenticated && loadingUserSurveys)
        return (
            <div className="fcsc mt-5">
                <CircularProgress size={100}/>
            </div>
        );

    const surveys = userSurveys.filter(survey => !survey.is_test);
    const tests = userSurveys.filter(survey => survey.is_test);

    return (
        <div className={'mt-4 mw-800px mx-auto'}>
            {!isAuthenticated || (isAuthenticated && userSurveys.length === 0) ? (
                <div className={'welcome frc'}>
                    <div
                        className={`w-100 ${classes.textPrimary95} ${classes.bgContrast15} 
                        px-3 pt-3 pb-3 ls-01 fw-5 mt-3 fs-5 fcc gap-2 w-90 rounded-3`}
                        onClick={() => {
                            if (!isAuthenticated) {
                                showLoginModal()
                            } else {
                                navigate('/surveys/create/')
                            }
                        }}>
                        <h1 className={'fs-2'}>Конструктор опросов и тестов</h1>
                        <p className={`${classes.textPrimary75} fs-6`} style={{lineHeight: '1em'}}>
                            Собирайте статистику, делитесь доступом, просто начните, это просто!</p>
                        <Button className={`${classes.bgContrast25} 
                        ps-07em pt-05em mt-3`}>
                            <span className={'fs-07 fw-7 ls-01'}>Начать</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={'fccc gap-2'}>
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} ps-07em pt-05em ls-02 fw-5 mt-3 fs-6`}
                        onClick={() => {
                            if (!isAuthenticated) {
                                showLoginModal()
                            } else {
                                navigate('/surveys/create/')
                            }
                        }}>
                        Создать новый
                    </Button>
                    <div className={'fccc gap-3 w-100'}>
                        <div className={'frc'}>
                            <Tabs value={tab} onChange={handleTabChange}>
                                <Tab label="Опросы"/>
                                <Tab label="Тесты"/>
                            </Tabs>
                        </div>
                        <div className={'fc gap-2'}>
                            {tab === 0 && (
                                surveys.length > 0 ? (
                                    surveys.map(survey => (
                                        <div key={survey.id}
                                             className={`frcc gap-2 rounded-2 p-2 ${classes.bgContrast10}`}>
                                            <h5 className={'cursor-pointer m-0 ms-1 me-5'}
                                                onClick={() => navigate(`/surveys/${survey.slug}/`)}>
                                                {survey.title}
                                            </h5>
                                            {survey.author === user.id && (
                                                <>
                                                    <ShareIcon className={'me-5px'}
                                                               onClick={() => handleOpenSlugModal(survey)}/>
                                                    <EditIcon onClick={() => navigate(`/surveys/${survey.slug}/edit`)}/>
                                                    <DeleteIcon onClick={() => handleOpenDeleteModal(survey)}/>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <span className={'text-center'}>У вас пока нет опросов.</span>
                                )
                            )}
                            {tab === 1 && (
                                tests.length > 0 ? (
                                    tests.map(test => (
                                        <div key={test.id}
                                             className={`frcc gap-2 rounded-2 p-2 ${classes.bgContrast10}`}>
                                            <h5 className={'cursor-pointer m-0 ms-1 me-5'}
                                                onClick={() => navigate(`/surveys/${test.slug}/`)}>
                                                {test.title}
                                            </h5>
                                            {test.author === user.id && (
                                                <>
                                                    <ShareIcon className={'me-5px'}
                                                               onClick={() => handleOpenSlugModal(test)}/>
                                                    <EditIcon onClick={() => navigate(`/surveys/edit/${test.slug}/`)}/>
                                                    <DeleteIcon onClick={() => handleOpenDeleteModal(test)}/>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <span className={'text-center'}>У вас пока нет тестов.</span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Modal className={'w-100 mw-300px'} isOpen={isAccessEditModalOpen}
                   onClose={() => setIsAccessEditModalOpen(false)}>
                <SurveyAccessEdit
                    survey={currentSurvey}
                    onSlugUpdate={handleSlugUpdate}/>
            </Modal>
            <Modal className={'w-100 mw-300px'}
                   isOpen={isDeleteModalOpen}
                   onClose={() => setIsDeleteModalOpen(false)}>
                <div className={'fccc gap-2'}>
                    <h5 className={`fs-6 fw-4 ${classes.textPrimary65}`}>Подтвердите удаление</h5>
                    <span className={'fw-5 mb-2'}>{currentSurvey?.title}</span>
                    <div className={'frc gap-2'}>
                        <Button className={`${classes.textContrast} bg-danger fw-7`}
                                onClick={handleDeleteSurvey}>
                            Удалить
                        </Button>
                        <Button className={`${classes.textContrast95} ${classes.bgContrast85} fw-7`}
                                onClick={() => setIsDeleteModalOpen(false)}>
                            Отмена
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SurveysMainPage;
