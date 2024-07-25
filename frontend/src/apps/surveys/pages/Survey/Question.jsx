import {Checkbox, CircularProgress, FormControlLabel, TextField} from "@mui/material";
import XLinearProgress from "../../../core/components/elements/XLinearProgress/XLinearProgress";
import MDEditor from "@uiw/react-md-editor";
import React from "react";
import {formatTime} from "./Survey";
import ScrollAvailableHint from "../../../core/components/elements/ScrollAvailableHint";

export const Question = ({
                             question,
                             currentQuestionIndex,
                             questionTimeLeft,
                             handleChangeResponse,
                             handleTextResponseChange,
                             responses,
                             showCorrectAnswers,
                             loading,
                             isFinished
                         }) => {
    const response = responses[currentQuestionIndex];
    const isCompleted = response.completed;

    return (
        <div className="question-container mt-1 overflow-y-auto position-relative">
            {loading
                ? <div className={'frc py-4'}><CircularProgress style={{width: 110, height: 110}}/></div>
                : (
                    <>
                        {isCompleted && !isFinished
                            ?
                            <div className="frcc fs-5 question-completed mt-2 mb-3">
                                <p>Для этого вопроса время истекло.</p>
                            </div>
                            :
                            <>
                                {questionTimeLeft !== null && questionTimeLeft >= 0 && (
                                    <div className="question-timer mb-2">
                                        <p>На этот вопрос осталось {formatTime(questionTimeLeft)}</p>
                                        <XLinearProgress
                                            value={(questionTimeLeft / (question.time_limit_minutes * 60)) * 100}
                                        />
                                    </div>
                                )}
                            </>
                        }
                        <ScrollAvailableHint direction="down" position={{bottom: '15px', right: '10px'}}/>
                        <div className={`${isCompleted && !isFinished ? 'opacity-50' : ''}`}>
                            <MDEditor.Markdown source={question.text} className={'mb-3'}/>
                            {question.question_type === 'choices' && (
                                <div className="choices mt-3 fc gap-2">
                                    {question.choices.map((choice, index) => {
                                        const isCorrectChoice = choice.is_correct;
                                        const isUserSelected = response.selected_choices.includes(choice.id);
                                        const allCorrectSelected = question.choices.every(c => !c.is_correct || response.selected_choices.includes(c.id));
                                        let bgClass = '';

                                        if (isFinished) {
                                            if (isUserSelected && isCorrectChoice && !allCorrectSelected) {
                                                bgClass = 'bg-orange-25';
                                            } else if (isCorrectChoice) {
                                                bgClass = 'bg-success bg-opacity-25';
                                            } else if (isUserSelected) {
                                                bgClass = 'bg-danger bg-opacity-25';
                                            }
                                        }

                                        return (
                                            <FormControlLabel
                                                className={`${isFinished ? 'm-0 p-1' : 'mw-90'} rounded-3 ${bgClass}`}
                                                key={index}
                                                control={
                                                    <Checkbox
                                                        checked={isUserSelected}
                                                        onChange={() => handleChangeResponse(currentQuestionIndex, choice.id)}
                                                        disabled={isCompleted || isFinished}
                                                        className={`
                                    ${choice.text.length > 255 ? 'mb-auto mt-2' : ''}
                                    ${isFinished ? 'd-none' : ''}`}
                                                    />
                                                }
                                                classes={{label: 'mw-100'}}
                                                label={<MDEditor.Markdown source={choice.text}/>}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {question.question_type === 'text' && (
                                <div className="mt-3">
                                    <TextField
                                        value={response.text}
                                        onChange={(e) => handleTextResponseChange(currentQuestionIndex, e.target.value)}
                                        disabled={isCompleted || isFinished}
                                        className="w-100"
                                        multiline
                                        rows={4}
                                    />
                                </div>
                            )}
                            {question.question_type === 'text' && isFinished && (
                                <p className={'mt-3 bg-success bg-opacity-25 p-3 rounded-3'}>
                                    <MDEditor.Markdown source={question.correct_text_answer} className={'mb-3'}/>
                                </p>
                            )}
                        </div>
                        {showCorrectAnswers && isCompleted && (
                            <div className="correct-answers mt-3">
                                <h4>Верные ответы:</h4>
                                {question.question_type === 'choices' && (
                                    <ul>
                                        {question.choices.filter(choice => choice.is_correct).map((choice, index) => (
                                            <li key={index} className="correct-answer">{choice.text}</li>
                                        ))}
                                    </ul>
                                )}
                                {question.question_type === 'text' && (
                                    <p className="correct-answer">{question.correct_text_answer}</p>
                                )}
                            </div>
                        )}
                    </>
                )}
        </div>
    );
};
