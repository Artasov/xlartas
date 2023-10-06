class Note {
    constructor(note, octave) {
        if (typeof note !== 'string') {
            throw new Error('Parameter "note" must be a string');
        }
        if (!Number.isInteger(octave)) {
            throw new Error('Parameter "octave" must be an integer');
        }

        this.note = note;
        this.octave = octave;
    }

    equals(otherNote, withoutOctave=false) {
        if (withoutOctave){
            return this.note === otherNote.note;
        }
        return this.note === otherNote.note && this.octave === otherNote.octave;
    }
}

export default Note;