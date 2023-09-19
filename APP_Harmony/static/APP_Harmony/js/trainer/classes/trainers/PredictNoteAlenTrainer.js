import BaseAlenTrainer from "./BaseAlenTrainer.js";
import {trainerPresets} from "../../constants/trainer_presets.js";
import Note from "../../../shared/classes/Note.js";
import {cadences} from "../../../shared/constants/cadences.js";
import {getClosestNote} from "../../../shared/shared_funcs.js";

class PredictNoteAlenTrainer extends BaseAlenTrainer {
    constructor(
        presetName,
        presetCategory,
        workFieldId,
        pianoPlayer,
        notesDuration,
        cadenceDuration
    ) {
        const preset = PredictNoteAlenTrainer._getPreset(presetName, presetCategory);
        super(
            preset.presetName,
            presetCategory,
            preset.countQuestions,
            workFieldId,
            preset.pianoStartNote,
            preset.enabledNotes,
            preset.availableReplay,
            notesDuration,
            pianoPlayer,
            preset.cadenceName,
            preset.playCadenceEveryNQuestion,
            preset.cadenceOctave,
            cadenceDuration,
        );
        this.hiddenKeyOctave = preset.hiddenKeyOctave;
        this.currentHiddenKey = null;
    }

    static _getPreset(presetName, presetCategory) {
        let preset;
        if (trainerPresets[presetCategory][presetName]) {
            preset = trainerPresets[presetCategory][presetName];
            return preset;
        } else {
            throw new Error(`Preset "${presetName}" not found`);
        }
    }

    start() {
        this._fillWorkField();

        const event = new CustomEvent('trainerStart');
        window.dispatchEvent(event);

        this._nextQuestion();
    }

    finish() {
        this.exit();
    }

    _nextQuestion() {
        if (this.currentQuestionNumber === this.countQuestions) {
            this.finish();
            return;
        }
        this._increaseCurrentQuestionCount();
        this.currentHiddenKey = this._getRandomNoteFromAvailable();
        this._playQuestion();
    }

    _fillWorkField() {
        for (let i = 0; i < this.piano.keysEls.length; i++) {
            if (this.piano.enabledKeysEls.includes(this.piano.keysEls[i])) {
                this.piano.keysEls[i].addEventListener('click', () => {
                    this._checkAnswer(i);
                });
            }
        }
        this.workField.appendChild(this.piano.pianoEl);
        const trainerControls = document.createElement('div');
        trainerControls.classList.add('frc', 'gap-3');
        trainerControls.appendChild(this._createBtnPlayQuestion())
        trainerControls.appendChild(this._createBtnPlayCurrentHiddenKey())
        this.workField.appendChild(trainerControls)
        this.workField.classList.remove('d-none');
    }

    async _checkAnswer(indexKeyEl) {
        if (this.piano.isPressAvailable) {
            this.stopAllSounds();
            this.piano.cancelAllHighlights();
            this.piano.isHighlightAvailable = true;
            if (this.piano.keysEls[indexKeyEl].textContent === this.currentHiddenKey.note) {
                this.piano.isPressAvailable = false;
                this.piano.highlight.setSuccess();
                await this.piano.player.playFromTo(
                    this.currentHiddenKey,
                    getClosestNote(
                        this.currentHiddenKey,
                        this.pianoStartNote.note
                    ),
                    this.piano.disabledNotes,
                    this.notesDuration,
                    this.notesDuration,
                )
                ;
                this._increaseRightAnswer();
                setTimeout(() => {
                    this._nextQuestion();
                }, 500);
            } else {
                this.piano.highlight.setDanger();
                this.piano.highlightKey(indexKeyEl);
                this._decreaseWrongAnswer();
            }
        }
    }

    _getRandomNoteFromAvailable() {
        const randomIndex = Math.floor(Math.random() * this.enabledNotes.length);
        return this.enabledNotes[randomIndex];
    }


    _playQuestion() {
        this.stopAllSounds();
        this.piano.cancelAllHighlights();
        this.piano.isHighlightAvailable = true;
        this.piano.highlight.setWarning();
        const cadence = cadences[this.cadenceName];
        const totalCadenceDuration = (this.cadenceDuration + 100) *
            (cadence.length - 1) + this.cadenceDuration;

        this.piano.player.playCadence(
            this.pianoStartNote.note,
            this.cadenceName,
            this.cadenceDuration + 500,
            this.cadenceDuration,
        );

        let timeoutId = setTimeout(() => {
            this.piano.isHighlightAvailable = false;
            this.piano.player.playNote(this.currentHiddenKey, this.notesDuration)
            this.piano.isPressAvailable = true;
        }, totalCadenceDuration);
        this.timeouts.push(timeoutId);
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
            this.stopAllSounds();
            this.piano.isHighlightAvailable = false;
            this.piano.player.playNote(
                this.currentHiddenKey,
                this.notesDuration,
            )
        })
        return btn;
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
}

export default PredictNoteAlenTrainer;