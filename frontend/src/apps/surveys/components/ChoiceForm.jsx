import React, {useState} from 'react';
import {Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import axiosInstance from "../../core/components/auth/axiosConfig";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {Message} from "../../core/components/Message";
import DeleteIcon from '@mui/icons-material/Delete';
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'highlight.js/styles/github-dark.css';
import {useStyles} from "../../core/components/Theme/useStyles";

const ChoiceForm = ({choice, onSave, onRemove, question, isNewChoiceForm, setIsQuestionFormVisible}) => {
    const {isAuthenticated, frontendLogout} = useAuth(AuthContext);
    const [title, setTitle] = useState(choice?.title || '');
    const [text, setText] = useState(choice?.text || '');
    const [points, setPoints] = useState(choice?.points || '');
    const [isCorrect, setIsCorrect] = useState(choice?.is_correct || false);
    const classes = useStyles();

    const handleSaveChoice = async () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(frontendLogout);
            return;
        }
        const choiceData = {
            title: title,
            text: text,
            points: points,
            is_correct: isCorrect,
            question: question?.id
        };

        try {
            let response;
            if (choice) {
                response = await axiosInstance.put('/api/surveys/choices/update/', {
                    ...choiceData,
                    choice_id: choice.id
                });
                Message.success('Choice updated successfully.');
            } else {
                response = await axiosInstance.post('/api/surveys/choices/create/', choiceData);
                Message.success('Choice created successfully.');
                setText('');
                setPoints('');
                setIsCorrect(false);
            }
            onSave(response.data);
            setIsQuestionFormVisible(true);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    return (
        <div className={`fc gap-2 rounded-2 p-3 ${choice ? 'border-white' : 'border-blue'}`}>
            <TextField
                label="Метка (необязательно)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <MDEditor
                value={text}
                onChange={setText}
                height={500}
            />
            <TextField
                label="Баллов за этот ответ"
                value={points}
                type={'number'}
                helperText={'За ответ можно как получить балл так и потерять. Можно указывать отрицательные числа.'}
                onChange={(e) => setPoints(e.target.value)}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isCorrect}
                        onChange={(e) => setIsCorrect(e.target.checked)}
                    />
                }
                label="Верный вариант"
            />
            <div className={'frcc gap-2'}>
                <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                        onClick={handleSaveChoice}>
                    {choice ? 'Сохранить изменения' : 'Добавить вариант'}
                </Button>
                {choice && (
                    <DeleteIcon className={`${classes.textPrimary70} fs-08`}
                                fontSize="inherit"
                                onClick={() => onRemove(choice.id)}/>
                )}
            </div>
        </div>
    );
};

export default ChoiceForm;
