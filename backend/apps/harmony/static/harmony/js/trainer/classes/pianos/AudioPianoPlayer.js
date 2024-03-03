import BasePianoPlayer from "./BasePianoPlayer.js";
import {NOTE_MAP, NOTES} from "../../../shared/constants/notes.js";
import {scales} from "../../../shared/constants/scales.js";
import {cadences} from "../../../shared/constants/cadences.js";
import Chord from "../../../shared/classes/Chord.js";
import {getDirection, getNotesBetween} from "../../../shared/shared_funcs.js";

class AudioPianoPlayer extends BasePianoPlayer {
    constructor(audioNotes) {
        super();
        this.audioNotes = audioNotes;
        this.timeouts = [];
        this.noteTimeouts = [];
        this.noteIntervals = [];
        this.gain_value = 0.63;

    }

    playNote(note, duration_ms, gain_value = this.gain_value) {
        const note_str = `${note.note}${note.octave}`;
        if (this.audioNotes[note_str]) {
            // Если для этой ноты уже существует тайм-аут, отменить его
            if (this.noteTimeouts[note_str]) {
                clearTimeout(this.noteTimeouts[note_str]);
            }
            if (this.noteIntervals[note_str]) {
                clearInterval(this.noteIntervals[note_str]);
            }
            window.dispatchEvent(new CustomEvent('notePlaying', {
                detail: {note, duration_ms}
            }));

            const audio = this.audioNotes[note_str];
            audio.pause(); // остановить воспроизведение
            audio.currentTime = 0; // сбросить текущее время аудио
            audio.volume = gain_value;
            audio.play(); // начать воспроизведение с начала

            // Сохранение тайм-аута в объекте timeouts
            this.noteTimeouts[note_str] = setTimeout(() => {
                this.noteIntervals[note_str] = setInterval(() => {
                    if (audio.volume > 0.1) {
                        audio.volume -= 0.1;
                    } else {
                        clearInterval(this.noteIntervals[note_str]);
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = gain_value;
                    }
                }, 50);
            }, duration_ms);
        } else {
            console.error(`Note '${note.note}' not found in the noteMap.`);
        }
    }

    playFromTo(fromNote, toNote, skipNotes, interval_ms, duration_ms) {
        let skipNotesCutoff = [];
        skipNotes.forEach(note => {
            if (note.note !== fromNote.note && note.note !== toNote.note) {
                skipNotesCutoff.push(note)
            }
        })
        const notesArray = getNotesBetween(fromNote, toNote, skipNotesCutoff);

        window.dispatchEvent(new CustomEvent('noteProgressionPlaying', {
            detail: {notesArray}
        }));
        return this.playNotesProgression(notesArray, interval_ms, duration_ms);
    }


    playCadence(scaleName, cadenceName, octave, duration_ms, interval_ms) {
        if (!scales[scaleName]) {
            console.error(`Scale '${scaleName}' not found.`);
            return;
        }
        if (!cadences[cadenceName]) {
            console.error(`Cadence '${cadenceName}' not found.`);
            return;
        }
        const scaleNoteName = scaleName.replace('m', '');
        const scaleNoteIndex = NOTES.indexOf(scaleNoteName);

        const cadence = cadences[cadenceName].map((step, stepIndex) => {
            const chordNotes = scales[scaleName][step];
            if (!chordNotes) {
                console.error('Some steps in the cadence were not found in the scale.');
                return;
            }
            const firstNoteIndex = NOTES.indexOf(chordNotes[0]);
            if (firstNoteIndex < scaleNoteIndex) {
                return new Chord(null, octave + 1, chordNotes);
            } else {
                return new Chord(null, octave, chordNotes);
            }


        });

        if (cadence.includes(undefined)) {
            console.error('Some steps in the cadence were not found in the scale.');
            return;
        }

        this.playChordsProgression(cadence, interval_ms, duration_ms);
    }

    playChordsProgression(progression, interval_ms, duration_ms) {
        this.stopAllSounds(); // Ensure all current sounds and timeouts are cleared before starting a new progression
        progression.forEach((chord, index) => {
            let timeoutId = setTimeout(() => {
                this.playChord(chord, duration_ms);
            }, index * (interval_ms));
            this.timeouts.push(timeoutId);
        });
    }

    playChord(chord, duration_ms) {
        const notes = chord.notes;
        this.playNotesSimultaneously(notes, duration_ms);
    }

    playNotesSimultaneously(noteList, duration_ms) {
        const reducedGainValue = this.gain_value - this.gain_value * 0.36;
        noteList.forEach(note => {
            this.playNote(note, duration_ms, reducedGainValue);
        });
    }

    playNotesProgression(notes, interval_ms, duration_ms) {
        return new Promise((resolve) => {
            notes.forEach((note, index) => {
                setTimeout(() => {
                    this.playNote(note, duration_ms);
                    if (index === notes.length - 1) {
                        resolve();
                    }
                }, index * (interval_ms));
            });
        });
    }

    stopAllSounds() {
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts = [];
    }
}

export default AudioPianoPlayer;

