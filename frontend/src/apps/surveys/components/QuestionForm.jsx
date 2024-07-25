import React, {useState} from 'react';
import {Button, Checkbox, FormControlLabel, Radio, RadioGroup, TextField} from "@mui/material";
import ChoiceForm from "./ChoiceForm";
import './SurveyMarkdownEditor.css';
import axiosInstance from "../../core/components/auth/axiosConfig";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {Message} from "../../core/components/Message";
import Modal from "../../core/components/elements/Modal/Modal";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from "@mui/icons-material/Done";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'highlight.js/styles/github-dark.css';
import {useStyles} from "../../core/components/Theme/useStyles";

const QuestionForm = ({survey, question, onSave, isNewQuestionForm}) => {
    const {isAuthenticated, frontendLogout} = useAuth(AuthContext);
    const [text, setText] = useState(question?.text || '');
    const [correctTextAnswer, setCorrectTextAnswer] = useState(question?.correct_text_answer || '');
    const [title, setTitle] = useState(question?.title || '');
    const [timeLimitMinutes, setTimeLimitMinutes] = useState(question?.time_limit_minutes || '');
    const [pointsForText, setPointsForText] = useState(question?.points_for_text || 1);
    const [questionType, setQuestionType] = useState(question?.question_type || 'text');
    const [choices, setChoices] = useState(question?.choices || []);
    const [isSaved, setIsSaved] = useState(!isNewQuestionForm);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [currentChoice, setCurrentChoice] = useState(null);
    const [isRequired, setIsRequired] = useState(question?.is_required || true);
    const [isQuestionFormVisible, setIsQuestionFormVisible] = useState(true);
    const classes = useStyles();

    const handleSaveQuestion = async () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(frontendLogout);
            return;
        }
        const questionData = {
            title: title,
            text: text,
            question_type: questionType,
            survey: survey.id,
            order: question?.order || survey.questions.length + 1,
            is_required: isRequired,
            points_for_text: pointsForText,
            correct_text_answer: correctTextAnswer,
            time_limit_minutes: timeLimitMinutes || null
        };

        try {
            let response;
            if (question) {
                response = await axiosInstance.put(
                    '/api/surveys/questions/update/',
                    {...questionData, question_id: question.id}
                );
                const updatedQuestion = {...response.data, choices};
                Message.success('Question updated successfully.');
                onSave(updatedQuestion);
            } else {
                response = await axiosInstance.post('/api/surveys/questions/create/', questionData);
                Message.success('Question created successfully.');
                const newQuestion = {...response.data, choices: []};
                onSave(newQuestion);
                setText('');
                setTitle('');
                setTimeLimitMinutes('');
                setCorrectTextAnswer('');
                setPointsForText(1);
                setQuestionType('text');
                setIsSaved(true);
            }
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleAddChoice = async (choiceData) => {
        setChoices([...choices, choiceData]);
        setIsChoiceModalOpen(false);
        setIsQuestionFormVisible(true);
    };

    const handleRemoveChoice = async (choiceId) => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(frontendLogout);
            return;
        }
        try {
            await axiosInstance.delete('/api/surveys/choices/delete/', {
                data: {choice_id: choiceId}
            });
            setChoices(choices.filter(c => c.id !== choiceId));
            Message.success('Choice removed successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleUpdateChoice = async (updatedChoice) => {
        setChoices(choices.map(c => (c.id === updatedChoice.id ? updatedChoice : c)));
        setIsChoiceModalOpen(false);
        setIsQuestionFormVisible(true);
    };

    const openModalForChoice = (choice = null) => {
        setCurrentChoice(choice);
        setIsChoiceModalOpen(true);
        setIsQuestionFormVisible(false);
    };

    return (
        <div className={`fc rounded-2 p-3 ${isNewQuestionForm ? 'border-blue' : 'border-white'}`}>
            {isQuestionFormVisible && (
                <>
                    <RadioGroup
                        className={'frc mb-1'}
                        row
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}>
                        <FormControlLabel value="text" control={<Radio/>} label="Текст"/>
                        <FormControlLabel value="choices" control={<Radio/>} label="Множественный выбор"/>
                    </RadioGroup>
                    <div className={'fc gap-3'} data-color-mode={"dark"}>
                        <TextField
                            label="Метка (необязательно)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            className={'mw-250px'}
                            label="Время прохождения (мин)"
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
                        <TextField
                            className={'mw-250px'}
                            inputProps={{min: 1}}
                            label="Очки за верный текстовый ответ."
                            helperText={'Не учитывается при общем подсчете.'}
                            value={pointsForText}
                            onChange={(e) => setPointsForText(e.target.value)}
                            type="number"
                        />
                        <MDEditor
                            value={text}
                            onChange={setText}
                            height={500}
                        />
                    </div>
                    <div className={'frbc my-2'}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isRequired}
                                    onChange={(e) => setIsRequired(e.target.checked)}
                                />
                            }
                            label="Обязательный"
                        />
                    </div>
                    {questionType === 'choices' && isSaved && (
                        <div>
                            <div className={'frsc gap-2'}>
                                <h5 className={'m-0'}>Варианты ответов</h5>
                                <AddIcon className={`${classes.textPrimary70} fs-08`}
                                         onClick={() => openModalForChoice(null)}/>
                            </div>
                            <div className={'fc gap-2 my-2'}>
                                {(choices || []).map((choice, index) => (
                                    <div key={index} className={`fc rounded-2 p-2 ps-3 ${classes.bgContrast10}`}>
                                        <div className={'frcc gap-2'}>
                                            <span>{choice.title ? choice.title : choice.text}</span>
                                            {choice.is_correct && <DoneIcon className={'text-success fs-6 mb-1px'}/>}
                                            <EditIcon className={`ms-auto ${classes.textPrimary70} fs-08`}
                                                      onClick={() => openModalForChoice(choice)}/>
                                            <DeleteIcon className={`${classes.textPrimary70} fs-08`}
                                                        onClick={() => handleRemoveChoice(choice.id)}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {questionType === 'text' && (
                        <div className={'fc gap-2'}>
                            <h5>Верный ответ</h5>
                            <MDEditor
                                value={correctTextAnswer}
                                onChange={setCorrectTextAnswer}
                                height={500}
                            />
                        </div>
                    )}
                    {!question && questionType === 'choices' && (
                        <span className={'text-center'}>
                            Варианты ответов можно будет добавить после создания вопроса.
                        </span>
                    )}
                    <div className={'frc gap-3 mt-2'}>
                        <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                                onClick={handleSaveQuestion}>
                            {question ? 'Сохранить изменения' : 'Добавить вопрос'}
                        </Button>
                        <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                                onClick={() => onSave(question)}>
                            Закрыть
                        </Button>
                    </div>
                </>
            )}
            <Modal className={'w-100 mw-1000px'}
                   isOpen={isChoiceModalOpen}
                   onClose={() => {
                       setIsChoiceModalOpen(false);
                       setIsQuestionFormVisible(true);
                   }}>
                <ChoiceForm
                    question={question}
                    choice={currentChoice}
                    onSave={currentChoice ? handleUpdateChoice : handleAddChoice}
                    onRemove={handleRemoveChoice}
                    isNewChoiceForm={!currentChoice}
                    setIsQuestionFormVisible={setIsQuestionFormVisible}
                />
            </Modal>
        </div>
    );
};

export default QuestionForm;
