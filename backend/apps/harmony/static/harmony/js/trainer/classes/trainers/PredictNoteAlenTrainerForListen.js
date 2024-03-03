import PredictNoteAlenTrainer from "./PredictNoteAlenTrainer.js";
import {cadences} from "../../../shared/constants/cadences.js";
import {getClosestNote, getNotesBetween} from "../../../shared/shared_funcs.js";
import Note from "../../../shared/classes/Note.js";

class PredictNoteAlenTrainerForListen extends PredictNoteAlenTrainer {
    constructor(
        preset,
        workFieldId,
        pianoPlayer,
        notesDuration,
        notesInterval,
        cadenceDuration,
        cadenceInterval,
    ) {
        super(
            preset,
            workFieldId,
            pianoPlayer,
            notesDuration,
            notesInterval,
            cadenceDuration,
            cadenceInterval,
        );
    }

    finish() {
        this.stopAllSounds()
        this.exit();
    }

    async start() {
        this._fillWorkField();

        const event = new CustomEvent('trainerStart');
        window.dispatchEvent(event);

        for (let i = 0; i < this.countQuestions; i++) {
            // запускаем вопрос
            await this._nextQuestion();

            // ждем некоторое время перед тем как играть ответ (подразумевается что _playQuestion занимает время)
            await new Promise(resolve => setTimeout(resolve, this.notesDuration + 500)); // +500 мс как пример

            // играем правильный ответ
            for (let j = 0; j < this.piano.keysEls.length; j++) {
                if (this.piano.keysEls[j].textContent === this.currentHiddenNote.note) {
                    await this._checkAnswer(j);
                    break;
                }
            }
            await new Promise(resolve => setTimeout(resolve, this.notesDuration + 500));
        }
    }

    async _playQuestion() {
        this.piano.isPressAvailable = false;
        this.piano.cancelAllHighlights();
        this.piano.isHighlightAvailable = true;
        this.piano.highlight.setWarning();
        let totalCadenceDuration = 0;
        if (this.currentCadenceSkips === 1) {
            const cadence = cadences[this.cadenceName];
            totalCadenceDuration = (this.cadenceInterval) *
                (cadence.length) + this.cadenceInterval;
            this.piano.player.playCadence(
                this.currentScale.scaleName,
                this.cadenceName,
                this.piano.allCurrentPianoNotes[0].octave,
                this.cadenceDuration,
                this.cadenceInterval,
            );
            this.currentCadenceSkips += this.playCadenceEveryNQuestion
        }
        this.currentCadenceSkips -= 1;

        console.log(this.currentCadenceSkips)

        await new Promise((resolve) => {
            let timeoutId = setTimeout(() => {
                this.piano.isHighlightAvailable = false;
                this.piano.player.playNote(this.currentHiddenNote, this.notesDuration);
                resolve(); // Вызовите resolve, когда setTimeout завершится
            }, totalCadenceDuration);
            this.timeouts.push(timeoutId);
        });
    }

    async _checkAnswer(i) {
        this.piano.cancelAllHighlights();
        this.piano.isHighlightAvailable = true;
        const currentHiddenNote = new Note(
            this.currentHiddenNote.note,
            this.currentHiddenNote.octave,
        )
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
            this.notesInterval,
            this.notesDuration,
        );

        this._increaseRightAnswer();
    }
}

export default PredictNoteAlenTrainerForListen;