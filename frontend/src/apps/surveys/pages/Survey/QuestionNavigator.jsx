import {useStyles} from "../../../core/components/Theme/useStyles";
import React from "react";

export const QuestionNavigator = ({questions, currentQuestionIndex}) => {
    const classes = useStyles();

    return (<div className="question-navigator w-100 frc gap-2">
        {questions.map((_, index) => (<div
            key={index}
            style={{width: 40}}
            className={`frcc fw-6 ratio-1-1 rounded-circle transition-all transition-d-300 
                    ${index === currentQuestionIndex ? `${classes.bgContrast90} ${classes.textContrast}` : `${classes.bgContrast40} ${classes.textPrimary}`}`}
        >
            {index + 1}
        </div>))}
    </div>);
};