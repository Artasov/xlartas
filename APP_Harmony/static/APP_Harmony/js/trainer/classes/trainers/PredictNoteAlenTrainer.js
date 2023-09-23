import BaseAlenTrainer from "./BaseAlenTrainer.js";
import Note from "../../../shared/classes/Note.js";
import {cadences} from "../../../shared/constants/cadences.js";
import {
    fillChromaticFromToNoteList,
    findNoteHalf,
    getClosestNote, getNotesBetween,
    getRandomMajorScaleName,
    getRandomMinorScaleName,
    getRandomScaleName, notesToIndices
} from "../../../shared/shared_funcs.js";
import PianoEl from "../pianos/PianoEl.js";
import Scale from "../../../shared/classes/Scale.js";
import ProgressCircleBar from "../../../../../../../static/Core/js/progress_circle_bar.js";
import {fetchTrainerPresets, populatePresetAccordion} from "../../trainer_presets_menu.js";
import {randomIntInRange} from "../../../../../../../static/Core/js/shared_funcs.js";

class PredictNoteAlenTrainer extends BaseAlenTrainer {
    constructor(
        preset,
        workFieldId,
        pianoPlayer,
        notesDuration,
        cadenceDuration
    ) {
        super(
            preset.presetName,
            preset.presetCategory,
            preset.countQuestions,
            workFieldId,
            notesDuration,
            pianoPlayer,
            preset.cadenceName,
            preset.playCadenceEveryNQuestion,
            preset.cadenceOctave,
            cadenceDuration,
        );
        console.log()
        if (preset.scaleName === 'randomMajor') {
            this.presetScale = preset.scaleName
        } else if (preset.scaleName === 'randomMinor') {
            this.presetScale = preset.scaleName
        } else if (preset.scaleName === 'random') {
            this.presetScale = preset.scaleName
        } else {
            this.presetScale = new Scale(preset.scaleName, preset.scaleOctave)
        }
        this.preset = preset;
        this.degrees = preset.degrees;
        this.isChromatic = preset.chromatic;
        this.currentScale = undefined;
        this.currentEnabledNotes = undefined;
        this.piano = undefined;
        this.availableReplay = preset.availableReplay;
        this.currentHiddenNote = null;
        this.currentCadenceSkips = 1;
        this.hiddenNoteOctave = preset.hiddenNoteOctave;

        this.btnPlayCurrentHiddenNote = undefined;
        this.btnPlayQuestion = undefined;
    }

    start() {
        this._fillWorkField();

        const event = new CustomEvent('trainerStart');
        window.dispatchEvent(event);

        this._nextQuestion();
    }


    _nextQuestion() {
        console.log(`Next Question: ${this.currentQuestionNumber}`)
        this.currentScale = typeof this.presetScale === 'string' ?
            this.presetScale.toString() : this.presetScale.copy()
        let currentScale = undefined;
        if (this.currentQuestionNumber === this.countQuestions) {
            this.finish();
            return;
        }
        if (this.presetScale === 'randomMajor') {
            const randomScale = new Scale(getRandomMajorScaleName());
            if (findNoteHalf(randomScale.rootNote) === 2) {
                randomScale.decreaseOctave(1);
            }
            this.currentScale = randomScale;
        } else if (this.presetScale === 'randomMinor') {
            const randomScale = new Scale(getRandomMinorScaleName());
            if (findNoteHalf(randomScale.rootNote) === 2) {
                randomScale.decreaseOctave(1);
            }
            this.currentScale = randomScale;
        } else if (this.presetScale === 'random') {
            const randomScale = new Scale(getRandomScaleName());
            if (findNoteHalf(randomScale.rootNote) === 2) {
                randomScale.decreaseOctave(1);
            }
            this.currentScale = randomScale;
        } else {
            if (findNoteHalf(this.presetScale.rootNote) === 2) {
                this.currentScale.decreaseOctave(1);
            }
        }
        this.pianoField.innerHTML = '';
        this.currentEnabledNotes = [];
        for (let i = 0; i < this.degrees.length; i++) {
            if (this.degrees[i] === 8) {
                this.currentEnabledNotes.push(
                    new Note(
                        this.currentScale.notes[0].note,
                        this.currentScale.notes[0].octave + 1
                    )
                )
                continue;
            }
            this.currentEnabledNotes.push(this.currentScale.notes[this.degrees[i] - 1]);
        }
        if (this.isChromatic) {
            if (this.degrees.length === 8) {
                this.currentEnabledNotes.push(
                    new Note(
                        this.currentEnabledNotes[1].note,
                        this.currentEnabledNotes[1].octave + 1,
                    )
                )
            }
            this.currentEnabledNotes = fillChromaticFromToNoteList(
                this.currentEnabledNotes[0],
                this.currentEnabledNotes[this.currentEnabledNotes.length - 1],
            );
        }
        this.piano = new PianoEl(this.currentScale.notes[0], this.currentEnabledNotes, this._pianoPlayer)
        this.pianoField.appendChild(this.piano.pianoEl)
        for (let i = 0; i < this.piano.keysEls.length; i++) {
            if (this.piano.enabledKeysEls.includes(this.piano.keysEls[i])) {
                this.piano.keysEls[i].addEventListener('click', () => {
                    this._checkAnswer(i);
                });
            }
        }
        this._increaseCurrentQuestionCount();
        this.currentHiddenNote = this._getRandomNoteFromAvailable();
        if (this.hiddenNoteOctave === -1) {
            this.currentHiddenNote.octave = randomIntInRange(3, 6);
        }

        this._playQuestion();

        console.log('AFTER NEXT QUESTION')
        console.log(this.presetScale)
        console.log(this.currentHiddenNote)
    }

    _fillWorkField() {
        const trainerControls = document.createElement('div');
        trainerControls.classList.add('frc', 'gap-3');
        this.btnPlayQuestion = this._createBtnPlayQuestion()
        this.btnPlayCurrentHiddenNote = this._createBtnPlayCurrentHiddenNote()
        trainerControls.appendChild(this.btnPlayQuestion)
        trainerControls.appendChild(this.btnPlayCurrentHiddenNote)
        this.workField.appendChild(trainerControls)
        this.workField.classList.remove('d-none');
    }

    async _checkAnswer(indexKeyEl) {
        if (this.piano.isPressAvailable) {
            this.stopAllSounds();
            this.piano.cancelAllHighlights();
            this.piano.isHighlightAvailable = true;
            const currentHiddenNote = new Note(
                this.currentHiddenNote.note,
                this.currentHiddenNote.octave,)
            if (this.piano.keysEls[indexKeyEl].textContent === currentHiddenNote.note) {
                this.piano.isPressAvailable = false;
                this.piano.highlight.setSuccess();
                let notesForSkipping = [];
                if (this.isChromatic) {
                    const notes = getNotesBetween(
                        currentHiddenNote,
                        getClosestNote(
                            currentHiddenNote,
                            this.currentScale.notes[0].note,
                        )
                    );
                    notes.forEach(note => {
                        if (note.note.includes('#')) {
                            if (note.note !== currentHiddenNote.note) {
                                notesForSkipping.push(note);
                            }
                        }
                    })
                }
                notesForSkipping = notesForSkipping.concat(this.piano.disabledNotes);
                this.piano.tonicOctaveIcreased = true
                const closestNote = getClosestNote(
                    currentHiddenNote,
                    this.currentScale.notes[0].note,
                )

                await this.piano.player.playFromTo(
                    currentHiddenNote,
                    closestNote,
                    notesForSkipping,
                    this.notesDuration,
                    this.notesDuration,
                );

                this._increaseRightAnswer();
                setTimeout(() => {
                    this._nextQuestion();
                }, 500);
            } else {
                console.log('wrong')
                this.piano.highlight.setDanger();
                this.piano.highlightKey(indexKeyEl, this.notesDuration);
                this._decreaseWrongAnswer();
            }
        }
    }

    _getRandomNoteFromAvailable() {
        const randomIndex =
            Math.floor(Math.random() * this.currentEnabledNotes.length);
        return this.currentEnabledNotes[randomIndex];
    }

    _playQuestion() {
        this.stopAllSounds();
        this.piano.cancelAllHighlights();
        this.piano.isHighlightAvailable = true;
        this.piano.highlight.setWarning();
        let totalCadenceDuration = 0;
        if (this.currentCadenceSkips === 1) {
            const cadence = cadences[this.cadenceName];
            totalCadenceDuration = (this.cadenceDuration + 100) *
                (cadence.length - 1) + this.cadenceDuration;
            this.piano.player.playCadence(
                this.currentScale.scaleName,
                this.cadenceName,
                this.piano.allCurrentPianoNotes[0].octave,
                this.cadenceDuration + 500,
                this.cadenceDuration,
            );
            this.currentCadenceSkips += this.playCadenceEveryNQuestion
        }
        this.currentCadenceSkips -= 1;


        let timeoutId = setTimeout(() => {
            this.piano.isHighlightAvailable = false;
            this.piano.player.playNote(this.currentHiddenNote, this.notesDuration)
            this.piano.isPressAvailable = true;
        }, totalCadenceDuration);
        this.timeouts.push(timeoutId);
    }

    _createBtnPlayCurrentHiddenNote() {
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
            this.stopAllSounds();
            this.piano.isHighlightAvailable = false;
            this.piano.player.playNote(
                this.currentHiddenNote,
                this.notesDuration,
            )
        })
        return btn;
    }

    _createBtnPlayQuestion() {
        const btn = document.createElement('button');
        btn.classList.add('btn-3')
        btn.innerHTML = 'Replay';
        btn.addEventListener('click', () => {
            if (this.availableReplay) {
                this._playQuestion();
            }
        })
        return btn;
    }

    _createBtnExitAfterFinish() {
        const btnDiv = document.createElement('div');
        btnDiv.classList.add('frc');
        const btn = document.createElement('button');
        btn.classList.add('btn-3', 'fs-4')
        btn.innerHTML = 'Exit';
        btn.addEventListener('click', () => {
            this.exit();
        })
        btnDiv.appendChild(btn)
        return btnDiv;
    }

    _showResult() {
        const progressBarScale = 1.4;
        const progressBar =
            new ProgressCircleBar(progressBarScale, '#930d53', '#292466');
        this.pianoField.innerHTML = '';
        const mt = 1.3 * 20 * progressBarScale;
        const mb = 1.3 * 30 * progressBarScale;
        progressBar.element.style.margin = `${mt}px auto ${mb}px auto`;
        this.pianoField.appendChild(progressBar.element);
        this.pianoField.appendChild(this._createBtnExitAfterFinish());
        this.btnPlayCurrentHiddenNote.remove();
        this.btnPlayQuestion.remove();
        const totalAttempts = this.countQuestions + this.wrongAnswers;
        const rightAnswerPercentage = Math.round(
            ((this.countQuestions / totalAttempts) * 100).toFixed(2)
        );
        this.rightAnswerPercentage = rightAnswerPercentage;

        progressBar.setValue(rightAnswerPercentage, 1000);
    }

    finish() {
        this._showResult();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/harmony/trainer/save_preset_result/', true);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

        xhr.onload = function () {
            if (xhr.status === 201) {
                console.log("Result saved successfully:", xhr.responseText);
            } else {
                console.error("Failed to save result:", xhr.responseText);
            }
        };

        const data = JSON.stringify({
            "right_answer_percentage": this.rightAnswerPercentage,
            "preset": this.preset.id  // Замените на ID текущего пресета
        });
        xhr.send(data);
    }
}

export default PredictNoteAlenTrainer;