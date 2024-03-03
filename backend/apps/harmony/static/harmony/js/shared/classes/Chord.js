import {NOTES} from "../constants/notes.js";
import Note from "./Note.js";
import {createNotesObjectsListByNoteList, notesToIndices} from "../shared_funcs.js";

class Chord {
    static majorChordPattern = [0, 4, 7];
    static minorChordPattern = [0, 3, 7];

    constructor(chordName = null, rootNoteOctave = 4, notesArray = null) {
        this.notes = [];
        if (notesArray) {
            this.notes = createNotesObjectsListByNoteList(
                notesToIndices(notesArray), rootNoteOctave);
        } else {
            this.notes = this.generateChordNotesObjects(chordName, rootNoteOctave);
        }
    }

    generateChordNotesObjects(chordName, rootNoteOctave) {
        const chordNotesArray = this.generateChordNotes(chordName);
        return createNotesObjectsListByNoteList(chordNotesArray, rootNoteOctave);
    }



    generateChordNotes(chordName) {
        const isMinor = chordName.endsWith('m');
        const rootNote = isMinor ? chordName.slice(0, -1) : chordName;
        const pattern = isMinor ? Chord.minorChordPattern : Chord.majorChordPattern;
        const rootNoteIndex = NOTES.indexOf(rootNote);

        if (rootNoteIndex === -1) throw new Error(`Invalid chord name: ${chordName}`);

        return pattern.map(interval => (rootNoteIndex + interval) % 12);
    }
}

export default Chord;