class BaseTrainerControllersGenerator {
    constructor() {
        this.btnSubmitExit = undefined;
    }

    createTitleEl(presetName) {
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('frb', 'px-3', 'mb-4');

        const title = document.createElement('h2');
        title.style.paddingLeft = '23px';
        title.classList.add('fs-2', 'text-center', 'text-white-80', 'w-100', 'm-0');
        title.innerHTML = presetName;
        const exitBtn = this._createBtnExit();
        titleDiv.appendChild(title);
        titleDiv.appendChild(exitBtn);
        titleDiv.appendChild(this._createModalSubmitExit())
        return titleDiv;
    }

    _createBtnExit() {
        const btnExit = document.createElement('button');
        btnExit.setAttribute('type', 'button');
        btnExit.classList.add('btn-close', 'popover-dismiss');
        btnExit.setAttribute('data-bs-toggle', 'modal');
        btnExit.setAttribute('data-bs-target', '#trainerExitModal');
        return btnExit;
    }

    _createCurrentStatsEl(rightAnswerId, wrongAnswerId, currentQuestionId, amountQuestion) {
        const currentStatsEl = document.createElement('div');

        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('frc', 'gap-1');

        this.rightAnswerSpan = document.createElement('span');
        this.rightAnswerSpan.classList.add('text-success');
        this.rightAnswerSpan.id = rightAnswerId;
        this.rightAnswerSpan.innerHTML = '0';
        const slashSpan = document.createElement('span');
        slashSpan.classList.add('text-white-60');
        slashSpan.innerHTML = '/';
        this.wrongAnswerSpan = document.createElement('span');
        this.wrongAnswerSpan.classList.add('text-danger');
        this.wrongAnswerSpan.id = wrongAnswerId;
        this.wrongAnswerSpan.innerHTML = '0';

        scoreDiv.appendChild(this.rightAnswerSpan);
        scoreDiv.appendChild(slashSpan);
        scoreDiv.appendChild(this.wrongAnswerSpan);

        const counterQuestionDiv = document.createElement('div');
        counterQuestionDiv.classList.add('fcc');
        this.currentQuestionSpan = document.createElement('span');
        this.amountQuestionSpan = document.createElement('span');

        this.currentQuestionSpan.classList.add('text-white-60');
        this.currentQuestionSpan.id = currentQuestionId;
        this.amountQuestionSpan.classList.add('text-white-60');
        this.amountQuestionSpan.innerHTML = amountQuestion;
        this.currentQuestionSpan.innerHTML = '0';

        const slashSpan2 = slashSpan.cloneNode(true)

        const helpWrapper = document.createElement('div');
        helpWrapper.classList.add('frc', 'fs-2', 'gap-1');
        helpWrapper.appendChild(this.currentQuestionSpan);
        helpWrapper.appendChild(slashSpan2);
        helpWrapper.appendChild(this.amountQuestionSpan);

        counterQuestionDiv.appendChild(helpWrapper)

        currentStatsEl.classList.add('fs-1', 'frb', 'fw-bold', 'mx-auto');
        currentStatsEl.style.width = '80%';
        currentStatsEl.style.maxWidth = '400px';
        currentStatsEl.appendChild(scoreDiv);
        currentStatsEl.appendChild(counterQuestionDiv);

        return currentStatsEl;
    }

    _createModalSubmitExit() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('id', 'trainerExitModal');
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'infoModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        const modalDialog = document.createElement('div');
        modalDialog.classList.add('modal-dialog', 'modal-dialog-centered', 'w-min', 'mx-auto');
        modal.appendChild(modalDialog);

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content', 'bg-black-25', 'backdrop-blur-20');
        modalDialog.appendChild(modalContent);

        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');
        modalContent.appendChild(modalHeader);

        const modalTitle = document.createElement('h1');
        modalTitle.classList.add('modal-title', 'fs-5', 'text-white-90', 'white-space-no-wrap');
        modalTitle.setAttribute('id', 'infoModalLabel');
        modalTitle.textContent = 'Do u want to exit?';
        modalHeader.appendChild(modalTitle);

        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body', 'frc', 'gap-2');
        modalContent.appendChild(modalBody);

        const yesButton = document.createElement('button');
        yesButton.classList.add('btn-3');
        yesButton.setAttribute('aria-label', 'Close');
        yesButton.setAttribute('data-bs-dismiss', 'modal');
        yesButton.setAttribute('id', 'btn-trainer-exit');
        yesButton.textContent = 'Yes';
        this.btnSubmitExit = yesButton;
        modalBody.appendChild(yesButton);

        const noButton = document.createElement('button');
        noButton.classList.add('btn-3');
        noButton.setAttribute('aria-label', 'Close');
        noButton.setAttribute('data-bs-dismiss', 'modal');
        noButton.textContent = 'No';
        modalBody.appendChild(noButton);

        return modal;
    }
}

export default BaseTrainerControllersGenerator;