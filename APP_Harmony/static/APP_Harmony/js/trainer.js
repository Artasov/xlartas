let isSoundsPreloaded = false;


function getScaleKeys(scale) {
    const fullKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const majorPattern = [2, 2, 1, 2, 2, 2, 1];
    const minorPattern = [2, 1, 2, 2, 1, 2, 2];

    const startIndex = fullKeys.indexOf(scale.slice(0, -1));
    const scaleType = scale.slice(-1).toLowerCase();

    if (startIndex === -1) {
        throw new Error(`Start key ${scale} not found`);
    }

    let pattern = scaleType === 'm' ? minorPattern : majorPattern;

    let currentIndex = startIndex;
    const scaleKeys = [fullKeys[currentIndex]];

    for (let i = 0; i < pattern.length; i++) {
        currentIndex = (currentIndex + pattern[i]) % fullKeys.length;
        scaleKeys.push(fullKeys[currentIndex]);
    }

    return scaleKeys;
}


class Trainer {
    constructor(presetName,
                pianoStartKey,
                enableKeys,
                countQuestions,
                cadenceProgression,
                playCadenceEveryNQuestion,
                hiddenKeyOctave,
                cadenceOctave,
                availableReplay) {
        this.presetName = presetName;
        this.tonic = pianoStartKey;
        this.enableKeys = enableKeys
        this.countQuestions = countQuestions
        this.cadenceProgression = cadenceProgression
        this.playCadenceEveryNQuestion = playCadenceEveryNQuestion
        this.hiddenKeyOctave = hiddenKeyOctave
        this.cadenceOctave = cadenceOctave
        this.availableReplay = availableReplay

        this.cadenceDuration = cadenceDuration.value
        this.notesDuration = notesDuration.value

        this.btnTrainerExit = document.getElementById('btn-trainer-exit');
        this.trainerField = document.getElementById('trainer-field');
        this.trainerMenu = document.getElementById('trainer-menu');
        this.trainerMenu.classList.add('d-none');
        this.trainerField.classList.remove('d-none');

        this.rightAnswerSpan = undefined;
        this.wrongAnswerSpan = undefined;

        this.fullPiano = new Piano(this.tonic)
        this.trainPiano = this._createPianoEl()

        this.currentQuestionNumber = 0;
        this.currentHiddenKey = null;
        this.rightAnswers = 0;
        this.wrongAnswers = 0;

        this._fillTrainerField();
    }

    start() {
        this.trainPiano.keysEls.forEach(keyEl => {
            if (!keyEl.classList.contains('piano-key-b-disabled') && !keyEl.classList.contains('piano-key-disabled')) {
                keyEl.addEventListener('click', () => {
                    if (keyEl.textContent === this.currentHiddenKey) {
                        this._increaseScore();

                        const playDuration = this._calculatePlayDuration(
                            this.currentHiddenKey, this.hiddenKeyOctave, this.notesDuration);

                        this.trainPiano.playFromToTonic(
                            this.currentHiddenKey,
                            this.hiddenKeyOctave,
                            this.notesDuration
                        );

                        setTimeout(() => {
                            this._nextQuestion();
                        }, playDuration);

                    } else {
                        this._decreaseScore();
                        keyEl.classList.add('piano-key-wrong');
                        setTimeout(() => {
                            keyEl.classList.remove('piano-key-wrong');
                        }, this.notesDuration)
                    }
                })
            }
        })
        this._nextQuestion()
    }

    finish() {
        this.exit();
    }

    exit() {
        this.trainPiano.stopPlayingAll();
        this.fullPiano.stopPlayingAll();
        this.trainerField.innerHTML = '';
        this.trainerMenu.classList.remove('d-none');
        this.trainerField.classList.add('d-none');
    }

    _createExitBtn() {
        const buttonElement = document.createElement("button");
        buttonElement.type = "button";
        buttonElement.className = "btn-close popover-dismiss my-auto";
        buttonElement.setAttribute("data-bs-toggle", "modal");
        buttonElement.setAttribute("data-bs-target", "#trainerExitModal");
        return buttonElement;
    }

    _increaseScore() {
        this.rightAnswers += 1;
        this.rightAnswerSpan.innerHTML = this.rightAnswers;
    }

    _decreaseScore() {
        this.wrongAnswers += 1;
        this.wrongAnswerSpan.innerHTML = this.wrongAnswers;
    }

    _calculatePlayDuration(startKey, octave, stepDuration) {
        const halfWay = this.trainPiano.current_keys.length / 2;
        let fromIndex = this.trainPiano.current_keys.indexOf(startKey);
        let targetIndex = fromIndex < halfWay ? 0 : 12;

        let stepCount = Math.abs(targetIndex - fromIndex);

        return stepCount * stepDuration + 400;
    }

    _nextQuestion() {
        if (this.currentQuestionNumber === this.countQuestions) {
            this.finish();
            return;
        }
        this.currentQuestionNumber += 1;
        this.currentHiddenKey = this._getRandomKeyFromAvailable()
        this._playQuestion();
    }

    _fillTrainerField() {
        this.btnTrainerExit.addEventListener('click', () => {
            this.exit();
        })

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('frb', 'px-3');

        const title = document.createElement('h2');
        title.style.paddingLeft = '23px';
        title.classList.add('fs-2', 'text-center', 'text-white-80', 'w-100', 'm-0');
        title.innerHTML = this.presetName;
        const exitBtn = this._createExitBtn();

        titleDiv.appendChild(title);
        titleDiv.appendChild(exitBtn);

        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('fs-1', 'frc', 'mx-auto', 'gap-1', 'fw-bold');

        this.rightAnswerSpan = document.createElement('span');
        this.rightAnswerSpan.classList.add('text-success');
        this.rightAnswerSpan.id = 'rightAnswerSpan';
        this.rightAnswerSpan.innerHTML = '0';
        const slashSpan = document.createElement('span');
        slashSpan.classList.add('text-white-60');
        slashSpan.innerHTML = '/';
        this.wrongAnswerSpan = document.createElement('span');
        this.wrongAnswerSpan.classList.add('text-danger');
        this.wrongAnswerSpan.id = 'wrongAnswerSpan';
        this.wrongAnswerSpan.innerHTML = '0';

        scoreDiv.appendChild(this.rightAnswerSpan);
        scoreDiv.appendChild(slashSpan);
        scoreDiv.appendChild(this.wrongAnswerSpan);

        this.trainerField.appendChild(titleDiv);
        this.trainerField.appendChild(scoreDiv);

        this.trainerField.appendChild(this.trainPiano.pianoEl);
        const trainerControls = document.createElement('div');
        trainerControls.classList.add('frc', 'gap-3');
        trainerControls.appendChild(this._createBtnPlayQuestion())
        trainerControls.appendChild(this._createBtnPlayCurrentHiddenKey())
        this.trainerField.appendChild(trainerControls)
    }

    _getRandomKeyFromAvailable() {
        const randomIndex = Math.floor(Math.random() * this.enableKeys.length);
        return this.enableKeys[randomIndex];
    }

    _createPianoEl() {
        const trainPiano = new Piano(this.tonic)
        trainPiano.enableOnlyKeys(this.enableKeys)
        trainPiano.createPianoEl();
        return trainPiano
    }

    _createBtnPlayCurrentHiddenKey() {
        const btn = document.createElement('button');
        btn.classList.add('btn-3', 'frc')
        const imgNote = document.createElement('img');
        imgNote.classList.add('my-auto')
        imgNote.style.width = '17px';
        imgNote.style.height = '17px';
        imgNote.style.filter = 'invert(0.9)';
        imgNote.src = '/static/APP_Harmony/img/note.png';
        btn.appendChild(imgNote);
        btn.addEventListener('click', () => {
            this.trainPiano.stopPlayingAll();
            this.trainPiano.playKey(
                `${this.currentHiddenKey}${this.hiddenKeyOctave}`,
                this.notesDuration,
                null,
                true
            )
        })
        return btn;
    }

    _playQuestion() {
        const cadence = this._generateCadence(this.tonic, this.cadenceProgression);
        const totalCadenceTime = cadence.reduce((sum, chord) => sum + chord.length, 0) * this.cadenceDuration + 400;

        this.fullPiano.playCadence(cadence, this.cadenceOctave, this.cadenceDuration);

        setTimeout(() => {
            this.trainPiano.stopPlayingAll();
            this.trainPiano.playKey(
                `${this.currentHiddenKey}${this.hiddenKeyOctave}`,
                this.notesDuration,
                null,
                true
            );
        }, totalCadenceTime);
    }

    _createBtnPlayQuestion() {
        const btn = document.createElement('button');
        btn.classList.add('btn-3')
        btn.innerHTML = 'Cadence';
        btn.addEventListener('click', () => {
            this._playQuestion();
        })
        return btn;
    }

    _generateCadence(key, progression) {
        if (!scales[key]) {
            throw new Error(`Unknown key: ${key}`);
        }
        return progression.map(step => {
            if (!scales[key][step]) {
                throw new Error(`Unknown progression step: ${step}`);
            }
            return scales[key][step];
        });
    }
}

function startTrainer(presetType, presetName = null) {
    if (!isSoundsPreloaded) {
        preloadSounds();
        preloadSounds();
    }
    if (presetName) {
        const preset = trainerPresets[presetType][presetName];
        const trainer = new Trainer(
            preset['presetName'],
            preset['pianoStartKey'],
            preset['enableKeys'],
            preset['countQuestions'],
            preset['cadenceProgression'],
            preset['playCadenceEveryNQuestion'],
            preset['hiddenKeyOctave'],
            preset['cadenceOctave'],
            preset['availableReplay'],
        );
        setTimeout(() => {
            trainer.start();
        }, 300)
    }
}

