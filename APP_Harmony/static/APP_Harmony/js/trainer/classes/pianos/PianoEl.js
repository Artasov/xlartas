import {NOTES} from "../../../shared/constants/notes.js";
import Note from "../../../shared/classes/Note.js";
import {generateNotesFromNoteToCount} from "../../../shared/shared_funcs.js";

class PianoElHighlightClasses {
    constructor() {
        this.warningClass = 'piano-key-warning';
        this.successClass = 'piano-key-success';
        this.dangerClass = 'piano-key-danger';
        this.class = undefined;
        this.setWarning()

    }

    setWarning() {
        this.class = this.warningClass;
    }

    setSuccess() {
        this.class = this.successClass;
    }

    setDanger() {
        this.class = this.dangerClass;
    }
}


class PianoEl {
    constructor(
        startNote,
        enabledNotes,
        player
    ) {
        this.startNote = startNote;
        this.enabledNotes = enabledNotes;
        this.disabledNotes = [];
        this.allCurrentPianoNotes = generateNotesFromNoteToCount(
            this.startNote, 14
        )

        this._enableOnlyNotes(enabledNotes);
        this.keysEls = [];
        this.enabledKeysEls = [];
        this.player = player;
        this.isPressAvailable = false;
        this.isHighlightAvailable = true;
        this.future_history = [];
        this.highlight = new PianoElHighlightClasses();
        this.pianoEl = this.createPianoEl();
        window.addEventListener('notePlaying', this._onNotePlaying.bind(this));
        window.addEventListener('noteProgressionPlaying', this._onProgressionPlaying.bind(this));
    }

    _onProgressionPlaying(event) {
        if (this.isHighlightAvailable) {
            this.future_history = [];
            event.detail.notesArray.forEach(note => {
                this.future_history.push(new Note(note.note, note.octave));
            })
            console.log('start adjust')
            this.adjustNotesToAvailableRange(this.future_history)
            console.log('end adjust')
            // this.future_history = this.adjustNotesToAvailableRange(event.detail.notesArray);
        }
    }

    adjustNotesToAvailableRange(notes) {
        // Вычисление средней октавы для массива нот
        const calculateAverageOctave = (notesArray) => {
            let totalOctave = 0;
            for (let note of notesArray) {
                totalOctave += note.octave;
            }
            return totalOctave / notesArray.length;
        };

        let averageOctaveOfNotes = calculateAverageOctave(notes);
        const averageOctaveOfPiano = calculateAverageOctave(this.allCurrentPianoNotes);

        // Ограничиваем количество попыток коррекции, чтобы избежать бесконечного цикла
        const maxAttempts = 20;
        let currentAttempt = 0;

        while (currentAttempt < maxAttempts) {
            // Проверяем, находятся ли все ноты внутри доступного диапазона
            const allNotesAreInsideRange = notes.every(note => {
                return this.allCurrentPianoNotes.some(pianoNote => pianoNote.equals(note));
            });

            if (allNotesAreInsideRange) {
                break;
            }

            if (averageOctaveOfNotes > averageOctaveOfPiano) {
                for (let note of notes) {
                    note.octave--;
                }
            } else {
                for (let note of notes) {
                    note.octave++;
                }
            }

            averageOctaveOfNotes = calculateAverageOctave(notes);
            currentAttempt++;
        }

        // Если после всех попыток ноты все равно не подходят, выводим предупреждение
        if (currentAttempt === maxAttempts) {
            console.warn('Unable to fit all notes inside the available range after multiple adjustments.');
        }

        return notes;
    }


    _onNotePlaying(event) {
        if (this.isHighlightAvailable) {
            this.highlightKey(
                event.detail.note,
                event.detail.duration_ms
            )
        }
    }

    highlightKey(note_or_index, duration_ms) {
        let index = null;

        if (Number.isInteger(note_or_index)) {
            index = note_or_index;
        } else {
            if (this.future_history && this.future_history.length > 0) {
                let adjustedNote = this.future_history.shift();
                index = this.allCurrentPianoNotes.findIndex(n => n.equals(adjustedNote));
            } else {
                index = this.allCurrentPianoNotes.findIndex(n => n.equals(note_or_index));
            }
        }

        if (index === -1) {
            console.warn('Note does not exist in current piano.');
            return;
        }
        this.keysEls[index].classList.add(this.highlight.class);
        setTimeout(() => {
            this.keysEls[index].classList.remove(this.highlight.class);
        }, duration_ms-duration_ms*0.7);
    }

    cancelAllHighlights() {
        this.keysEls.forEach(keyEl => {
            keyEl.classList.remove(this.highlight.dangerClass);
            keyEl.classList.remove(this.highlight.warningClass);
            keyEl.classList.remove(this.highlight.successClass);
        })
    }

    _enableOnlyNotes(notes) {
        this.disabledNotes = this.allCurrentPianoNotes.filter(currentNote =>
            !notes.some(note => note.equals(currentNote))
        );
    }

    createPianoEl() {
        const pianoEl = document.createElement('div');
        pianoEl.classList.add('piano');
        this.allCurrentPianoNotes.forEach((note) => {
            const keyEl = this.createKeyEl(
                note.note, this.disabledNotes.includes(note));
            pianoEl.appendChild(keyEl);
            this.keysEls.push(keyEl);
        });
        return pianoEl;
    }

    createKeyEl(key, isDisabled) {
        const keyEl = document.createElement('div');
        keyEl.classList.add('piano-key');
        const isKeyBlack = key.includes('#');

        if (isKeyBlack) {
            keyEl.classList.add('piano-key-b');
        }

        if (isDisabled) {
            if (isKeyBlack) {
                keyEl.classList.add('piano-key-b-disabled');
            } else {
                keyEl.classList.add('piano-key-disabled');
            }
        } else {
            this.enabledKeysEls.push(keyEl);
        }

        keyEl.textContent = key;
        return keyEl;
    }
}

export default PianoEl;