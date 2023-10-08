import BaseTrainerControllersGenerator from "./BaseTrainerControllersGenerator.js";


class BaseTrainer {
    constructor(presetName,
                presetCategory,
                countQuestions,
                workFieldId
    ) {
        this.presetName = presetName;
        this.presetCategory = presetCategory;

        this.countQuestions = countQuestions;
        this.workField = document.getElementById(workFieldId);
        this.currentQuestionNumber = 0;
        this.rightAnswers = 0;
        this.wrongAnswers = 0;
        this.fieldCountRightAnswers = undefined;
        this.fieldCountWrongAnswers = undefined;
        this.fieldQuestionNumber = undefined;

        this._addBaseTrainerEls();
    }

    static _getPreset(presetName) {

    }

    start() {

    }

    finish() {

    }

    _nextQuestion() {

    }

    _fillWorkField() {

    }


    exit() {
        this.workField.classList.add('d-none');
        const event = new CustomEvent('trainerExit');
        window.dispatchEvent(event);
        delete this;
    }

    _increaseRightAnswer() {
        this.rightAnswers += 1;
        this.fieldCountRightAnswers.innerText = this.rightAnswers;
    }

    _increaseCurrentQuestionCount() {
        this.currentQuestionNumber +=1;
        this.fieldQuestionNumber.innerText = this.currentQuestionNumber;
    }

    _increaseWrongAnswer() {
        this.wrongAnswers += 1;
        this.fieldCountWrongAnswers.innerText = this.wrongAnswers;
    }

    _addBaseTrainerEls() {
        const elsGenerator = new BaseTrainerControllersGenerator()
        this.workField.appendChild(elsGenerator.createTitleEl(this.presetName))

        const rightAnswerId = 'rightAnswerSpan';
        const wrongAnswerId = 'wrongAnswerSpan';
        const currentQuestionId = 'currentQuestionSpan';
        this.workField.appendChild(elsGenerator._createCurrentStatsEl(
            rightAnswerId,
            wrongAnswerId,
            currentQuestionId,
            this.countQuestions
        ))
        this.fieldCountRightAnswers =
            this.workField.querySelector(
                `#${rightAnswerId}`);
        this.fieldCountWrongAnswers =
            this.workField.querySelector(
                `#${wrongAnswerId}`);
        this.fieldQuestionNumber =
            this.workField.querySelector(
                `#${currentQuestionId}`);

        elsGenerator.btnSubmitExit.addEventListener('click', () => {
            this.exit();
        })
    }
}

export default BaseTrainer;


