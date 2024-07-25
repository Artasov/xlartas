import React, {useEffect, useState} from 'react';
import {Button, Checkbox, FormControlLabel, MenuItem, Select, TextField} from "@mui/material";
import axiosInstance from "../../core/components/auth/axiosConfig";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {Message} from "../../core/components/Message";
import QuestionForm from "../components/QuestionForm";
import Modal from "../../core/components/elements/Modal/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import BackIcon from '@mui/icons-material/ArrowBackIosNew';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {useStyles} from "../../core/components/Theme/useStyles";
import {useNavigate} from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';


const SurveyEdit = ({slug}) => {
    const {isAuthenticated, frontendLogout} = useAuth(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [finishText, setFinishText] = useState('');
    const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
    const [authorVisible, setAuthorVisible] = useState(false);
    const [randomQuestionOrder, setRandomQuestionOrder] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [themeMode, setThemeMode] = useState('');
    const [allowAnswerChanges, setAllowAnswerChanges] = useState(true);
    const [authorWillSeeAttempts, setAuthorWillSeeAttempts] = useState(false);
    const [attemptsAllowed, setAttemptsAllowed] = useState('');
    const [showCorrectAnswersAtEnd, setShowCorrectAnswersAtEnd] = useState(false);
    const [showTotalPointsAtEnd, setShowTotalPointsAtEnd] = useState(false);
    const [showCorrectAnswersAfterQuestion, setShowCorrectAnswersAfterQuestion] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [survey, setSurvey] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [isFinishTextModalOpen, setIsFinishTextModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const navigate = useNavigate();
    const classes = useStyles();

    useEffect(() => {
        axiosInstance.get(`/api/surveys/${slug}/`)
            .then(response => {
                const surveyData = response.data;
                setSurvey(surveyData);
                setTitle(surveyData.title);
                setDescription(surveyData.description);
                setFinishText(surveyData.finish_text);
                setTimeLimitMinutes(surveyData.time_limit_minutes);
                setAuthorVisible(surveyData.author_visible);
                setAuthorWillSeeAttempts(surveyData.author_will_see_attempts);
                setRandomQuestionOrder(surveyData.random_question_order);
                setIsPublic(surveyData.is_public);
                setThemeMode(surveyData.theme_mode);
                setAllowAnswerChanges(surveyData.allow_answer_changes);
                setAttemptsAllowed(surveyData.attempts_allowed);
                setShowCorrectAnswersAtEnd(surveyData.show_correct_answers_at_end);
                setShowTotalPointsAtEnd(surveyData.show_total_points_at_end);
                setShowCorrectAnswersAfterQuestion(surveyData.show_correct_answers_after_question);
                setQuestions(surveyData.questions.sort((a, b) => a.order - b.order));
            })
            .catch(error => {
                ErrorProcessing.byResponse(error, frontendLogout);
            });
    }, [slug, isAuthenticated]);

    const handleUpdateSurvey = async () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(frontendLogout);
            return;
        }
        const surveyData = {
            title: title,
            description: description,
            time_limit_minutes: timeLimitMinutes || null,
            attempts_allowed: attemptsAllowed || null,
            author_visible: authorVisible,
            random_question_order: randomQuestionOrder,
            author_will_see_attempts: authorWillSeeAttempts,
            is_public: isPublic,
            finish_text: finishText,
            theme_mode: themeMode,
            allow_answer_changes: allowAnswerChanges,
            show_correct_answers_at_end: showCorrectAnswersAtEnd,
            show_total_points_at_end: showTotalPointsAtEnd,
            show_correct_answers_after_question: showCorrectAnswersAfterQuestion,
        };
        try {
            await axiosInstance.put(`/api/surveys/survey/update/`, {
                ...surveyData, survey_id: survey.id,
            });
            setSurvey({...survey, ...surveyData});
            Message.success('Survey updated successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleAddQuestion = async (questionData) => {
        const newQuestion = {...questionData, order: questions.length + 1};
        setQuestions([...questions, newQuestion].sort((a, b) => a.order - b.order));
        setIsModalOpen(false);
    };

    const handleRemoveQuestion = async (questionId) => {
        try {
            await axiosInstance.delete('/api/surveys/questions/delete/', {data: {question_id: questionId}});
            setQuestions(questions.filter(q => q.id !== questionId).sort((a, b) => a.order - b.order));
            Message.success('Question removed successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleUpdateQuestion = async (updatedQuestion) => {
        const updatedQuestions = questions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q));
        setQuestions(updatedQuestions.sort((a, b) => a.order - b.order));
        setIsModalOpen(false);
    };

    const openModalForQuestion = (question = null) => {
        setCurrentQuestion(question);
        setIsModalOpen(true);
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedQuestions = Array.from(questions);
        const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
        reorderedQuestions.splice(result.destination.index, 0, movedQuestion);

        // Update order based on new positions
        const updatedQuestions = reorderedQuestions.map((question, index) => ({
            ...question,
            order: index + 1,
        }));

        setQuestions(updatedQuestions);

        try {
            await Promise.all(updatedQuestions.map(question =>
                axiosInstance.put('/api/surveys/questions/update/', {
                    ...question,
                    question_id: question.id
                })
            ));
            Message.success('Questions reordered successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const openDescriptionModal = () => {
        setIsDescriptionModalOpen(true);
    };
    const openFinishTextModal = () => {
        setIsFinishTextModalOpen(true);
    };

    const handleDescriptionSave = () => {
        setIsDescriptionModalOpen(false);
        handleUpdateSurvey();
    };
    const handleFinishTextSave = () => {
        setIsFinishTextModalOpen(false);
        handleUpdateSurvey();
    };

    return (
        <div className={'py-4 mw-700px mx-auto'}>
            <div className={'frsc gap-2 mb-4'}>
                <BackIcon onClick={() => navigate(`/surveys/`)}/>
                <h3 className={'mb-0'}>Редактирование {survey?.is_test ? "теста" : "опроса"}</h3>
            </div>
            <div className={'fc'}>
                <TextField
                    className={'mb-2'}
                    label="Метка"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    inputProps={{maxLength: 255}}
                    helperText={"Метка - название для вас. Отображаться при прохождении не будет."}
                />
                <Button
                    className={`${classes.textContrast95} ${classes.bgContrast85} mb-2`}
                    onClick={openDescriptionModal}>
                    Редактировать описание
                </Button>
                <Button
                    className={`${classes.textContrast95} ${classes.bgContrast85} mb-4`}
                    onClick={openFinishTextModal}>
                    Редактировать завершающий текст
                </Button>
                <div className={'fr gap-3 flex-wrap mb-3'}>
                    <TextField
                        className={'mw-350px'}
                        label="Время прохождения (мин) "
                        value={timeLimitMinutes}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value > 0) {
                                setTimeLimitMinutes(value);
                            } else {
                                setTimeLimitMinutes('');
                            }
                        }}
                        type="number"
                    />

                    <Select
                        className={'mw-200px'}
                        displayEmpty
                        renderValue={(value) => value === 'light' ? 'Светлая тема' : 'Темная тема'}
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                    >
                        <MenuItem value="" disabled>Выберите тему</MenuItem>
                        <MenuItem value="light">Светлая тема</MenuItem>
                        <MenuItem value="dark">Темная тема</MenuItem>
                    </Select>
                </div>
                <TextField
                    className={'mw-350px'}
                    label="Кол-во попыток "
                    helperText={'Максимальное кол-во прохождений.'}
                    value={attemptsAllowed}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value > 0) {
                            setAttemptsAllowed(value);
                        } else {
                            setAttemptsAllowed('');
                        }
                    }}
                    type="number"
                />
                <div className={'fc mt-2'}>
                    <FormControlLabel
                        control={<Checkbox checked={authorVisible}
                                           onChange={(e) => setAuthorVisible(e.target.checked)}/>}
                        label="Автор виден"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={randomQuestionOrder}
                                           onChange={(e) => setRandomQuestionOrder(e.target.checked)}/>}
                        label="Случайный порядок вопросов"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}/>}
                        label="Публичный"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={allowAnswerChanges}
                                           onChange={(e) => setAllowAnswerChanges(e.target.checked)}/>}
                        label="Разрешить изменение ответов"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showCorrectAnswersAtEnd}
                                           onChange={(e) => setShowCorrectAnswersAtEnd(e.target.checked)}/>}
                        label="Показывать правильные ответы в конце"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showTotalPointsAtEnd}
                                           onChange={(e) => setShowTotalPointsAtEnd(e.target.checked)}/>}
                        label="Показывать количество набранных баллов в конце"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showCorrectAnswersAfterQuestion}
                                           onChange={(e) => setShowCorrectAnswersAfterQuestion(e.target.checked)}/>}
                        label="Показывать правильные ответы после вопроса"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={authorWillSeeAttempts}
                                           onChange={(e) => setAuthorWillSeeAttempts(e.target.checked)}/>}
                        label="Автор(вы) видит результаты прохождений"
                    />
                </div>
                <div className={'frb'}>
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} mt-2 w-min ls-02 ps-08em`}
                        onClick={handleUpdateSurvey}>
                        Сохранить
                    </Button>
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} mt-2 w-min ls-02 ps-08em`}
                        onClick={() => navigate(`/surveys/${survey.slug}/`)}>
                        Просмотр
                    </Button>
                </div>
            </div>
            <div className={'fc gap-2 mt-4'}>
                <div className={'frsc gap-2'}>
                    <h4 className={'m-0'}>Вопросы</h4>
                    <AddIcon className={`${classes.textPrimary70} fs-08`} onClick={() => openModalForQuestion(null)}/>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={'fc gap-2'}>
                                {questions.map((question, index) => (
                                    <Draggable key={question.id} draggableId={String(question.id)} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`frcc gap-2 rounded-2 p-2 ${classes.bgContrast10}`}>
                                                <div
                                                    className={'frcc fs-5 ratio-1-1 bg-secondary bg-opacity-25 rounded-circle me-1'}
                                                    style={{height: '35px'}}>
                                                    {question.order}
                                                </div>
                                                <span>{question.title ? question.title : question.text}</span>
                                                <EditIcon className={`ms-auto ${classes.textPrimary70} fs-08`}
                                                          onClick={() => openModalForQuestion(question)}/>
                                                <DeleteIcon className={`${classes.textPrimary70} fs-08`}
                                                            onClick={() => handleRemoveQuestion(question.id)}/>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <Modal className={'w-100 mw-1000px'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <QuestionForm
                    survey={survey}
                    question={currentQuestion}
                    onSave={currentQuestion ? handleUpdateQuestion : handleAddQuestion}
                    onRemove={handleRemoveQuestion}
                    isNewQuestionForm={!currentQuestion}
                />
            </Modal>
            <Modal className={'w-100 mw-1000px'} isOpen={isDescriptionModalOpen}
                   onClose={() => setIsDescriptionModalOpen(false)}>
                <div className={'fc gap-2 p-4'}>
                    <MDEditor
                        value={description}
                        onChange={setDescription}
                        height={500}
                    />
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} mt-2 w-min ls-02 ps-08em`}
                        onClick={handleDescriptionSave}>
                        Сохранить
                    </Button>
                </div>
            </Modal>
            <Modal className={'w-100 mw-1000px'} isOpen={isFinishTextModalOpen}
                   onClose={() => setIsFinishTextModalOpen(false)}>
                <div className={'fc gap-2 p-4'}>
                    <p className={`${classes.textPrimary70}`}>
                        Текст который появится после прохождения survey.
                    </p>
                    <MDEditor
                        value={finishText}
                        onChange={setFinishText}
                        height={500}
                    />
                    <Button
                        className={`${classes.textContrast95} ${classes.bgContrast85} mt-2 w-min ls-02 ps-08em`}
                        onClick={handleFinishTextSave}>
                        Сохранить
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default SurveyEdit;
