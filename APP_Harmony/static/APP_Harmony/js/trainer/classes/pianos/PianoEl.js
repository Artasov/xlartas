import {NOTES} from "../../../shared/constants/notes.js";
import Note from "../../../shared/classes/Note.js";
import {generateNotesFromNoteToCount} from "../../../shared/shared_funcs.js";

class PianoElHighlightClasses{
    constructor() {
        this.warningClass = 'piano-key-warning';
        this.successClass = 'piano-key-success';
        this.dangerClass = 'piano-key-danger';
        this.class = undefined;
        this.setWarning()

    }
    setWarning(){
        this.class = this.warningClass;
    }
    setSuccess(){
        this.class = this.successClass;
    }
    setDanger(){
        this.class = this.dangerClass;
    }
}

class PianoEl {
    constructor(
        pianoStartNote,
        enabledNotes,
        player
    ) {
        this.enabledNotes = enabledNotes;
        this.disabledNotes = [];

        this.allCurrentPianoNotes = generateNotesFromNoteToCount(
            pianoStartNote, 14
        )

        this._enableOnlyNotes(enabledNotes);
        this.keysEls = [];
        this.enabledKeysEls = [];
        this.player = player;
        this.isPressAvailable = false;
        this.isHighlightAvailable = true;
        this.highlight = new PianoElHighlightClasses();
        this.pianoEl = this.createPianoEl();
        window.addEventListener('notePlaying', this._onNotePlaying.bind(this));
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
        if(Number.isInteger(note_or_index)){
            index = note_or_index;
        } else {
            index = this.allCurrentPianoNotes.findIndex(n => n.equals(note_or_index));
        }
        if (index === -1) {
            console.warn('Note does not exist in current piano.');
            return;
        }

        this.keysEls[index].classList.add(this.highlight.class);
        setTimeout(() => {
            this.keysEls[index].classList.remove(this.highlight.class);
        }, 200);
    }

    cancelAllHighlights(){
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

        if (key.includes('#')) {
            keyEl.classList.add('piano-key-b');
        }

        if (isDisabled) {
            keyEl.classList.add('piano-key-disabled');
        } else {
            this.enabledKeysEls.push(keyEl);
        }

        keyEl.textContent = key;
        return keyEl;
    }
}

export default PianoEl;