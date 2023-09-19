class BasePianoPlayer {
    constructor() {
        if (this.constructor === BasePianoPlayer) {
            throw new Error("BasePianoPlayer is an abstract class and cannot be instantiated directly.");
        }
        // Other initializations, if needed
    }

    playNote(note, duration_ms) {
        throw new Error("Method 'playNote' must be implemented.");
    }

    playFromTo(fromNote, toNote, interval_ms, duration_ms) {
        throw new Error("Method 'playFromTo' must be implemented.");
    }

    playChord(chord, duration_ms) {
        throw new Error("Method 'playChord' must be implemented.");
    }

    playNotesSimultaneously(noteList, duration_ms) {
        throw new Error("Method 'playNotesSimultaneously' must be implemented.");
    }

    playChordsProgression(progression, interval_ms, duration_ms) {
        throw new Error("Method 'playChordsProgression' must be implemented.");
    }

    playNotesProgression(notes, interval_ms, duration_ms) {
        throw new Error("Method 'playNotesProgression' must be implemented.");
    }

    playSound(frequency, duration_ms) {
        throw new Error("Method 'playSound' must be implemented.");
    }

    getFrequency({note, octave}) {
        throw new Error("Method 'getFrequency' must be implemented.");
    }
}

export default BasePianoPlayer;