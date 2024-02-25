import {getScaleKeys} from "../shared_funcs.js";
import Note from "./Note.js";
import {NOTES} from "../constants/notes.js";

class Scale {
    constructor(scaleName, octave = 4) {
        if (typeof scaleName !== 'string') {
            throw new Error('Parameter "scaleName" must be a string');
        }

        this.scaleName = scaleName;
        this.rootNote = scaleName.replace('m', '');
        this.octave = octave;

        const scaleKeys = getScaleKeys(scaleName);

        this.notes = scaleKeys.map((note, index) => {
            if (index > 0 && NOTES.indexOf(note) < NOTES.indexOf(scaleKeys[index - 1])) {
                octave++;
            }
            return new Note(note, octave);
        });
    }

    copy(){
        return new Scale(this.scaleName, this.octave)
    }

    increaseOctave(onValue) {
        this.notes.forEach(note => {
            note.octave += onValue;
        });
        this.octave += onValue; // Повышаем базовую октаву, чтобы соответствовать текущему состоянию нот
    }

    decreaseOctave(onValue) {
        this.notes.forEach(note => {
            note.octave = Math.max(note.octave - onValue, 0); // Убеждаемся, что октава не уходит ниже 0
        });
        this.octave = Math.max(this.octave - onValue, 0); // Понижаем базовую октаву, чтобы соответствовать текущему состоянию нот
    }
}

export default Scale;