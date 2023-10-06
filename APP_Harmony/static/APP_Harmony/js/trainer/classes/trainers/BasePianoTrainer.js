import BaseTrainer from "./BaseTrainer.js";
import PianoEl from "../pianos/PianoEl.js";

class BasePianoTrainer extends BaseTrainer {
    constructor(
        presetName,
        presetCategory,
        countQuestions,
        workFieldId,
        notesDuration,
        notesInterval,
        pianoPlayer
    ) {
        super(presetName, presetCategory, countQuestions, workFieldId);
        this.notesDuration = notesDuration;
        this.notesInterval = notesInterval;
        this.pianoField = document.createElement('div');
        this.workField.appendChild(this.pianoField);
        this._pianoPlayer = pianoPlayer;
        this.timeouts = [];
        this.piano = undefined;
    }

    stopAllSounds() {
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts = [];
        if (this.piano) {
            this.piano.player.stopAllSounds();
        }
    }
    exit() {
        this.workField.classList.add('d-none');
        const event = new CustomEvent('trainerExit');
        window.dispatchEvent(event);
        this.stopAllSounds();
        delete this._pianoPlayer;
        delete this.piano;
        delete this;

    }
}

export default BasePianoTrainer;