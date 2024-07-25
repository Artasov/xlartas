import React, {useEffect, useRef, useState} from 'react';
import axiosInstance from '../../../core/components/auth/axiosConfig';
import {useParams} from 'react-router-dom';
import {Button, CircularProgress} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-markdown-preview/markdown.css';
import 'highlight.js/styles/github-dark.css';
import './SurveyMarkDown.css';
import './SurveyBase.css';
import {useStyles} from "../../../core/components/Theme/useStyles";
import {ErrorProcessing} from "../../../core/components/ErrorProcessing";
import {useAuth} from "../../../core/components/auth/useAuth";
import {AuthContext} from "../../../core/components/auth/AuthContext";
import {Message} from "../../../core/components/Message";
import XLinearProgress from "../../../core/components/elements/XLinearProgress/XLinearProgress";
import {QuestionNavigator} from "./QuestionNavigator";
import {Question} from "./Question";
import ScrollAvailableHint from "../../../core/components/elements/ScrollAvailableHint";
import {hideHeaderAction} from "../../../../redux/actions";

const Survey = () => {
    const {user, frontendLogout} = useAuth(AuthContext);
    const {slug} = useParams();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showIntro, setShowIntro] = useState(true);
    const [showOutro, setShowOutro] = useState(false);
    const [questionTimesLeft, setQuestionTimesLeft] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentSurveyAttempt, setCurrentSurveyAttempt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const surveyStartTime = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        console.log('HIDE')
        hideHeaderAction();
    }, [slug])

    useEffect(() => {
        try {
            axiosInstance.get(`/api/surveys/${slug}/`).then((response => {
                const fetchedSurvey = response.data;
                if (fetchedSurvey.random_question_order) {
                    fetchedSurvey.questions = shuffleArray(fetchedSurvey.questions);
                }
                setSurvey(fetchedSurvey);
                setQuestions(fetchedSurvey.questions);
                setResponses(fetchedSurvey.questions.map(q => ({
                    question_id: q.id,
                    text: '',
                    selected_choices: [],
                    time_taken: 0,
                    start_time: null,
                    completed: false
                })));
            }));
        } catch (error) {
            console.log(error);
            ErrorProcessing.byResponse(error, frontendLogout);
        }

    }, [slug]);

    useEffect(() => {
        if (currentSurveyAttempt) {
            const interval = setInterval(() => {
                const startTime = new Date(currentSurveyAttempt.start_time).getTime();
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                const remainingTime = (survey.time_limit_minutes * 60) - elapsedTime;
                if (remainingTime <= 0) {
                    clearInterval(interval);
                    handleFinish();
                } else {
                    setCurrentSurveyAttempt(prev => ({
                        ...prev,
                        remaining_time: remainingTime
                    }));
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentSurveyAttempt, survey]);

    useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion?.time_limit_minutes && !responses[currentQuestionIndex].start_time) {
            setResponses([...responses]);
            setQuestionTimesLeft((prevTimes) => {
                const newTimes = [...prevTimes];
                newTimes[currentQuestionIndex] = currentQuestion.time_limit_minutes * 60;
                return newTimes;
            });
        }
    }, [currentQuestionIndex, questions, responses]);

    useEffect(() => {
        if (!isFinished) {
            const interval = setInterval(() => {
                setQuestionTimesLeft((prevTimes) => {
                    const newTimes = [...prevTimes];
                    for (let i = 0; i < newTimes.length; i++) {
                        if (newTimes[i] !== null && newTimes[i] > 0 && !responses[i].completed) {
                            newTimes[i] -= 1;
                        } else if (newTimes[i] === 0) {
                            responses[i].completed = true;
                            setResponses([...responses]);
                        }
                    }
                    return newTimes;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [questionTimesLeft, responses]);

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const handleNextQuestion = async () => {
        const isTimeUp = questionTimesLeft[currentQuestionIndex] !== null && questionTimesLeft[currentQuestionIndex] <= 0;
        console.log(isTimeUp)
        if (!isFinished && !isTimeUp && !isQuestionAnswered(currentQuestionIndex)) {
            Message.error('Пожалуйста, ответьте на текущий вопрос перед переходом к следующему.');
            return;
        }
        setLoading(true);
        if (currentQuestionIndex < questions.length - 1) {
            if (!isFinished) await createOrUpdateQuestionAttempt(currentQuestionIndex, false);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            if (!responses[currentQuestionIndex + 1].start_time) {
                if (!isFinished) await createOrUpdateQuestionAttempt(currentQuestionIndex + 1, true)
                responses[currentQuestionIndex + 1].start_time = Date.now();
                setResponses([...responses]);
            }
        }
        setLoading(false);
    };

    const handlePrevQuestion = async () => {
        setLoading(true);
        if (survey.allow_answer_changes && currentQuestionIndex > 0) {
            if (!isFinished) await createOrUpdateQuestionAttempt(currentQuestionIndex, false);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            if (!responses[currentQuestionIndex - 1].start_time) {
                if (!isFinished) await createOrUpdateQuestionAttempt(currentQuestionIndex - 1, true)
                responses[currentQuestionIndex - 1].start_time = Date.now();
                setResponses([...responses]);

            }
        }
        setLoading(false);
    };

    const handleStartSurvey = async () => {
        let data = undefined;
        try {
            const response = await axiosInstance.post(
                '/api/surveys/survey/attempt/create_or_get_last/',
                {
                    user: user.id,
                    survey: survey.id
                }
            );
            if (response.status === 201) {
                Message.success('Successful start of the survey.');
                surveyStartTime.current = Date.now();
            } else {
                Message.success('Last attempt loaded.');
            }
            data = response.data;
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
        if (!data) {
            Message.error('Не удалось корректно начать.');
            return;
        }
        setCurrentSurveyAttempt(data);
        const startTime = new Date(data.start_time).getTime();
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        setQuestionTimesLeft(questions.map((q, index) => {
            if (data.questions_attempts) {
                const attempt = data.questions_attempts.find(a => a.question === q.id);
                if (attempt) {
                    responses[index] = {
                        question_id: attempt.question,
                        text: attempt.text_answer || '',
                        selected_choices: attempt.selected_choices,
                        time_taken: attempt.time_taken,
                        start_time: attempt.start_time ? new Date(attempt.start_time).getTime() : Date.now(),
                        completed: !!attempt.end_time
                    };
                    if (q.time_limit_minutes) {
                        const questionElapsedTime = Math.floor((currentTime - new Date(attempt.start_time).getTime()) / 1000);
                        const timeLeft = attempt.end_time ? 0 : (q.time_limit_minutes * 60) - questionElapsedTime;
                        if (timeLeft <= 0) {
                            responses[index].completed = true;
                        }
                        return timeLeft;
                    }
                    return null;
                }
                return q.time_limit_minutes ? q.time_limit_minutes * 60 : null;
            }
        }));
        setResponses([...responses]);
        setShowIntro(false);
    };

    const stopAllTimers = () => {
        setQuestionTimesLeft(questionTimesLeft.map(() => null));
    };

    const handleFinish = async () => {
        stopAllTimers();
        const totalSurveyTime = Math.floor((Date.now() - surveyStartTime.current) / 1000);
        const responseData = {
            survey_id: survey.id,
            total_time_taken: totalSurveyTime,
            responses: responses.map((response) => ({
                ...response,
                time_taken: response.start_time
                    ? Math.floor((Date.now() - response.start_time) / 1000)
                    : response.time_taken
            }))
        };
        try {
            const response = await axiosInstance.put('/api/surveys/survey/attempt/update/', {
                ...responseData,
                attempt_id: currentSurveyAttempt.id,
                end_time: new Date().toISOString()
            });
            setQuestions(response.data.questions); // update questions with correct answers
            Message.success('Survey completed successfully!');
            setIsFinished(true);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };
    const handleShowOutro = () => {
        console.log('OUTRO')
        setShowOutro(true);
    }

    const createOrUpdateQuestionAttempt = async (questionIndex, createNew = false) => {
        if (!currentSurveyAttempt) {
            console.error("Survey attempt is null");
            return;
        }

        const response = responses[questionIndex];
        const payload = {
            attempt: currentSurveyAttempt.id,
            question: questions[questionIndex].id,
            selected_choices: response.selected_choices,
            text_answer: response.text,
            start_time: createNew ? new Date().toISOString() : new Date(response.start_time).toISOString(),
        };

        try {
            await axiosInstance.post('/api/surveys/question/attempt/create_or_update/', payload);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleChangeResponse = (questionIndex, choiceId) => {
        const response = responses[questionIndex];
        if (!response.start_time) {
            response.start_time = Date.now();
        }
        if (response.selected_choices.includes(choiceId)) {
            response.selected_choices = response.selected_choices.filter(id => id !== choiceId);
        } else {
            response.selected_choices.push(choiceId);
        }
        setResponses([...responses]);
    };

    const handleTextResponseChange = (questionIndex, text) => {
        const response = responses[questionIndex];
        if (!response.start_time) {
            response.start_time = Date.now();
        }
        response.text = text;
        setResponses([...responses]);
    };

    const isQuestionAnswered = (index) => {
        const response = responses[index];
        if (questions[index].question_type === 'choices') {
            return response.selected_choices.length > 0;
        } else if (questions[index].question_type === 'text') {
            return response.text.trim().length > 0;
        }
        return false;
    };

    if (!survey) return <div className="fcsc mt-5">
        <CircularProgress size={100}/>
    </div>;

    return (
        <div className="fc gap-2 py-3 max-vh-without-header mw-700px mx-auto">
            {showIntro ? (
                <>
                    <div className={'fc gap-3 position-relative overflow-y-auto'}>
                        <MDEditor.Markdown className={''} source={survey.description || ''}/>
                        <ScrollAvailableHint direction="down" position={{bottom: '10px', right: '10px'}}/>
                    </div>
                    <div className={'fc gap-2 my-2'}>
                        <h3 className={'mb-0'}>Условия прохождения</h3>
                        <div className={'fc gap-1 ps-2 fs-6'}>
                            <span className={'fs-6 fw-6'}>Время на выполнение:
                                <span className={'fw-3'}> {survey.time_limit_minutes
                                    ? `${survey.time_limit_minutes} мин`
                                    : 'не ограничено'}
                                </span>
                            </span>
                            <span className={'fs-6 fw-6'}>Количество попыток прохождения:
                                <span className={'fw-3'}> {survey.attempts_allowed
                                    ? `${survey.attempts_allowed}`
                                    : 'не ограничено'}
                                </span>
                            </span>
                            <span className={'fs-6 fw-6'}>Изменение ответов:
                                <span className={'fw-3'}> {survey.allow_answer_changes
                                    ? `вы можете изменять ответы на пройденные вопросы.`
                                    : 'вы <span class="fw-6">не</span> можете изменять ответы на пройденные вопросы'}
                                </span>
                            </span>
                            {survey.random_question_order &&
                                <span className={'fs-6 fw-6'}>Случайный порядок вопросов</span>}
                            {survey.author_visible &&
                                <span className={'fs-6 fw-6'}>Автор:
                                    <span className={'fw-3'}> {survey.author_name}</span>
                                </span>}
                            {survey.author_will_see_attempts &&
                                <span className={'fs-6 fw-6'}>Автор увидит ваши результаты</span>}
                        </div>
                    </div>
                    <Button
                        className={`${classes.textContrast95} fw-bold ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                        onClick={handleStartSurvey}
                    >
                        Начать
                    </Button>
                </>
            ) : isFinished ? (
                <>
                    {survey.show_correct_answers_at_end && !showOutro ? (
                        <>
                            <h3 className={'text-center m-0'}>Проверь свои ответы</h3>
                            <p className={`${classes.textPrimary70} text-center`}>
                                <span className={'text-success fw-bold'}>Зелёным </span>
                                показаны верные ответы,
                                <span className={'text-danger fw-bold'}> красным </span>
                                - ваш неверный ответ. <span className={'text-orange fw-bold'}> Оранжевым </span>
                                если ответ верный, но остались и другие верные ответы.
                            </p>
                            <QuestionNavigator
                                questions={questions}
                                currentQuestionIndex={currentQuestionIndex}
                                onQuestionSelect={setCurrentQuestionIndex}
                            />
                            <Question
                                question={questions[currentQuestionIndex]}
                                currentQuestionIndex={currentQuestionIndex}
                                questionTimeLeft={questionTimesLeft[currentQuestionIndex]}
                                handleChangeResponse={handleChangeResponse}
                                handleTextResponseChange={handleTextResponseChange}
                                responses={responses}
                                showCorrectAnswers={survey.show_correct_answers_after_question}
                                loading={loading}
                                isFinished={isFinished}
                            />
                            <div className="frb mt-2">
                                <Button
                                    className={`${
                                        currentQuestionIndex === 0
                                            ? classes.textContrast45
                                            : classes.textContrast
                                    } ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                                    onClick={handlePrevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    НАЗАД
                                </Button>
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <Button
                                        className={`${
                                            currentQuestionIndex === questions.length - 1
                                                ? classes.textContrast45
                                                : classes.textContrast
                                        } ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                                        onClick={handleNextQuestion}
                                        disabled={loading}
                                    >
                                        ДАЛЕЕ
                                    </Button>
                                ) : (
                                    <Button
                                        className={`${classes.textContrast} ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                                        onClick={handleShowOutro}
                                        disabled={loading}
                                    >
                                        ЗАВЕРШИТЬ
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : showOutro ? (
                        <div className="fcsc gap-3">
                            <MDEditor.Markdown className={'w-100'} source={survey.finish_text || ''}/>
                            {survey.show_total_points_at_end ? (
                                <div className={'fccc gap-3'}>
                                    {(() => {
                                        let totalPossiblePoints = 0;
                                        let totalUserPoints = 0;

                                        responses.forEach((response, index) => {
                                            const question = questions[index];
                                            if (question.question_type === 'choices') {
                                                const correctChoices = question.choices.filter(choice => choice.is_correct).map(choice => choice.id);
                                                const userChoices = response.selected_choices;

                                                // Calculate possible points for the question
                                                const possiblePoints = question.choices
                                                    .filter(choice => choice.is_correct && choice.points > 0)
                                                    .reduce((acc, choice) => acc + choice.points, 0);

                                                totalPossiblePoints += possiblePoints;

                                                // Calculate user points for the question
                                                const userPoints = question.choices
                                                    .filter(choice => userChoices.includes(choice.id))
                                                    .reduce((acc, choice) => acc + choice.points, 0);

                                                // Check if all correct choices are selected and no extra choices are selected
                                                if (correctChoices.every(val => userChoices.includes(val))) {
                                                    totalUserPoints += userPoints;
                                                }
                                            }
                                        });

                                        return (
                                            <>
                                                <div className={`${classes.bgContrast80} ${classes.textContrast95} 
                        fccc rounded-circle ratio-1-1 w-100 mw-250px mt-3`}>
                        <span className={'fs-01 fw-7'}
                              style={{letterSpacing: '-6px', lineHeight: '1em'}}>
                            {`${totalUserPoints} / ${totalPossiblePoints}`}
                        </span>
                                                    <h1 className={`${classes.textContrast65} mb-0`}>БАЛЛЫ</h1>
                                                </div>
                                                <p className={`${classes.textPrimary65}`}>
                                                    Вы набрали {totalUserPoints} из {totalPossiblePoints} возможных
                                                    баллов.
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : ''}


                        </div>
                    ) : ''}
                </>
            ) : (
                <>
                    {currentSurveyAttempt?.remaining_time !== undefined && (
                        <div className="survey-timer mb-2">
                            <p className={'text-center mb-2 fw-bold'}>Осталось {formatTime(currentSurveyAttempt.remaining_time)}</p>
                            <XLinearProgress
                                value={(currentSurveyAttempt.remaining_time / (survey.time_limit_minutes * 60)) * 100}
                            />
                        </div>
                    )}
                    <QuestionNavigator
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                    />
                    <Question
                        question={questions[currentQuestionIndex]}
                        currentQuestionIndex={currentQuestionIndex}
                        questionTimeLeft={questionTimesLeft[currentQuestionIndex]}
                        handleChangeResponse={handleChangeResponse}
                        handleTextResponseChange={handleTextResponseChange}
                        responses={responses}
                        showCorrectAnswers={survey.show_correct_answers_after_question}
                        loading={loading}
                    />
                    <div className="frb mt-2">
                        <Button
                            className={`${
                                currentQuestionIndex === 0
                                    ? classes.textContrast45
                                    : classes.textContrast
                            } ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                            onClick={handlePrevQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            НАЗАД
                        </Button>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                className={`${
                                    currentQuestionIndex === questions.length - 1
                                        ? classes.textContrast45
                                        : classes.textContrast
                                } ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                                onClick={handleNextQuestion}
                                disabled={loading}
                            >
                                ДАЛЕЕ
                            </Button>
                        ) : (
                            <Button
                                className={`${classes.textContrast} ${classes.bgContrast85} ls-02 ps-08em pt-05em`}
                                onClick={handleFinish}
                                disabled={loading}
                            >
                                ЗАВЕРШИТЬ
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export default Survey;
