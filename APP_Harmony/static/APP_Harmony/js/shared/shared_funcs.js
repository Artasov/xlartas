import {NOTES} from "./constants/notes.js";
import Note from "./classes/Note.js";
import {majorScalesNames, minorScalesNames} from "./constants/scales.js";

export function getScaleKeys(scale) {
    const fullKeys = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];

    const majorPattern = [2, 2, 1, 2, 2, 2, 1];
    const minorPattern = [2, 1, 2, 2, 1, 2, 2];

    const startIndex = fullKeys.indexOf(scale.replace('m', ''));
    const scaleType = scale.slice(-1).toLowerCase();

    if (startIndex === -1) {
        throw new Error(`Start key ${scale} not found`);
    }

    let pattern = scaleType === 'm' ? minorPattern : majorPattern;

    let currentIndex = startIndex;
    const scaleKeys = [fullKeys[currentIndex]];

    for (let i = 0; i < pattern.length - 1; i++) {
        currentIndex = (currentIndex + pattern[i]) % fullKeys.length;
        scaleKeys.push(fullKeys[currentIndex]);
    }

    return scaleKeys;
}

export function getRandomMajorScaleName() {
    return majorScalesNames[Math.floor(Math.random() * majorScalesNames.length)];
}

export function getRandomMinorScaleName() {
    return minorScalesNames[Math.floor(Math.random() * minorScalesNames.length)];
}

export function getRandomScaleName() {
    const scales = [...majorScalesNames, ...minorScalesNames];
    return scales[Math.floor(Math.random() * scales.length)];
}

export function notesToIndices(notesArray) {
    return notesArray.map(note => NOTES.indexOf(note));
}

export function createNotesObjectsListByNoteList(noteList, rootNoteOctave) {
    return noteList.map((noteIndex, index) => {
        const octave =
            index === 0 ?
                rootNoteOctave :
                (noteIndex < noteList[0] ?
                    rootNoteOctave + 1 :
                    rootNoteOctave);
        return new Note(NOTES[noteIndex], octave);
    });
}

export function fillChromaticFromToNoteList(fromNote, toNote) {
    return getNotesBetween(fromNote, toNote);
}

export function getNotesBetween(fromNote, toNote, skipNotes = []) {
    const startOctave = Math.min(fromNote.octave, toNote.octave);
    const endOctave = Math.max(fromNote.octave, toNote.octave);

    const startNoteIndex = NOTES.indexOf(fromNote.note) + (fromNote.octave - startOctave) * NOTES.length;
    const endNoteIndex = NOTES.indexOf(toNote.note) + (toNote.octave - startOctave) * NOTES.length;

    const allNotes = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
        for (let note of NOTES) {
            allNotes.push(new Note(note, octave));
        }
    }

    const slicedNotes = startNoteIndex > endNoteIndex
        ? allNotes.slice(endNoteIndex, startNoteIndex + 1).reverse()
        : allNotes.slice(startNoteIndex, endNoteIndex + 1);

    return slicedNotes.filter(note =>
        !skipNotes.some(skipNote =>
            skipNote.note === note.note
        )
    );
}

export function getClosestNote(note, targetNoteName) {
    if (!(note instanceof Note)) {
        throw new Error('Parameter "note" must be an instance of Note class');
    }

    if (!NOTES.includes(targetNoteName)) {
        throw new Error('Invalid target note name');
    }

    const noteIndex = NOTES.indexOf(note.note);
    const targetNoteIndex = NOTES.indexOf(targetNoteName);

    const forwardDistance = (targetNoteIndex - noteIndex + NOTES.length) % NOTES.length;
    const backwardDistance = (noteIndex - targetNoteIndex + NOTES.length) % NOTES.length;

    if (forwardDistance <= backwardDistance) {
        return new Note(targetNoteName, note.octave + Math.floor((noteIndex + forwardDistance) / NOTES.length));
    } else {
        return new Note(targetNoteName, note.octave + Math.floor((noteIndex - backwardDistance) / NOTES.length));
    }
}



export function getDirection(note1, note2) {
    const index1 = NOTES.indexOf(note1);
    const index2 = NOTES.indexOf(note2);

    if (index1 === -1 || index2 === -1) {
        throw new Error('Invalid notes');
    }

    const distanceUp = (index2 - index1 + NOTES.length) % NOTES.length;
    const distanceDown = (index1 - index2 + NOTES.length) % NOTES.length;

    return distanceUp < distanceDown ? 1 : -1;
}

export function findNoteHalf(note) {
    const index = NOTES.indexOf(note);

    if (index === -1) {
        return 'Note not found';
    }

    if (index < NOTES.indexOf('G')) {
        return 1;
    } else {
        return 2;
    }
}

export function generateNotesFromNoteToCount(startNote, countNotes) {
    let currentIndex = NOTES.indexOf(startNote.note);
    let currentOctave = startNote.octave;

    if (currentIndex === -1) {
        throw new Error(`Start note ${startNote.note} not found in the NOTES array.`);
    }

    const notesArray = [];

    for (let i = 0; i < countNotes; i++) {
        notesArray.push(new Note(NOTES[currentIndex], currentOctave));

        currentIndex += 1;

        if (currentIndex >= NOTES.length) {
            currentIndex = 0;
            currentOctave += 1;
        }
    }

    return notesArray;
}