import BasePianoPlayer from "./BasePianoPlayer.js";
import {NOTE_MAP} from "../../../shared/constants/notes.js";
import {scales} from "../../../shared/constants/scales.js";
import {cadences} from "../../../shared/constants/cadences.js";
import Chord from "../../../shared/classes/Chord.js";
import {getNotesBetween} from "../../../shared/shared_funcs.js";

class OscillatorPianoPlayer extends BasePianoPlayer {
    constructor() {
        super();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillators = [];
        this.timeouts = [];
        this.gain_value = 0.33;
    }

    playNote(note, duration_ms, gain_value = this.gain_value) {
        console.log(note)
        console.log(gain_value)
        const frequency = this.getFrequency(note);
        if (frequency) {
            window.dispatchEvent(new CustomEvent('notePlaying', {
                detail: {note, duration_ms}
            }));

            this.playSound(frequency, duration_ms, gain_value);
        } else {
            console.error(`Note '${note.note}' not found in the noteMap.`);
        }
    }

    playFromTo(fromNote, toNote, skipNotes, interval_ms, duration_ms) {
        const notesArray = getNotesBetween(fromNote, toNote, skipNotes);
        return this.playNotesProgression(notesArray, interval_ms, duration_ms);
    }


    playCadence(scaleKey, cadenceName, duration_ms, interval_ms) {
        if (!scales[scaleKey]) {
            console.error(`Scale '${scaleKey}' not found.`);
            return;
        }
        if (!cadences[cadenceName]) {
            console.error(`Cadence '${cadenceName}' not found.`);
            return;
        }

        const cadence = cadences[cadenceName].map(step => {
            const chordNotes = scales[scaleKey][step];
            if (!chordNotes) {
                console.error('Some steps in the cadence were not found in the scale.');
                return;
            }
            return new Chord(null, 4, chordNotes);
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

    playSound(frequency, duration_ms, gain_value = this.gain_value) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        // уровень gain остается неизменным на 70% длительности ноты
        const sustainTime = this.audioContext.currentTime + (duration_ms / 1000) * 0.1;
        const releaseTime = this.audioContext.currentTime + (duration_ms / 1000) + 1.5;
        gainNode.gain.setValueAtTime(gain_value, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(gain_value, sustainTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();

        this.oscillators.push({oscillator, gainNode});

        oscillator.onended = () => {
            this.oscillators = this.oscillators.filter(oscNode => oscNode.oscillator !== oscillator);
        };

        oscillator.stop(releaseTime);
    }

    stopAllSounds() {
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts = [];

        const fadeOutTime = 0.1;  // 5 milliseconds
        this.oscillators.forEach(({oscillator, gainNode}) => {
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + fadeOutTime);
            oscillator.stop(this.audioContext.currentTime + fadeOutTime);
        });
        this.oscillators = [];
    }

    getFrequency({note, octave}) {
        return NOTE_MAP[note] * Math.pow(2, octave - 4);
    }
}

export default OscillatorPianoPlayer;

