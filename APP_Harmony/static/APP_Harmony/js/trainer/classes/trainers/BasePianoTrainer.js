import BaseTrainer from "./BaseTrainer.js";
import PianoEl from "../pianos/PianoEl.js";

class BasePianoTrainer extends BaseTrainer {
    constructor(
        presetName,
        presetCategory,
        countQuestions,
        workFieldId,
        pianoStartNote,
        enabledNotes,
        availableReplay,
        notesDuration,
        pianoPlayer
    ) {
        super(presetName, presetCategory, countQuestions, workFieldId);
        this.pianoStartNote = pianoStartNote;
        this.enabledNotes = enabledNotes;
        this.availableReplay = availableReplay;
        this.notesDuration = notesDuration;

        this.timeouts = [];
        this.piano = new PianoEl(this.pianoStartNote, this.enabledNotes, pianoPlayer); // Использовал обновленное имя переменной
    }

    stopAllSounds() {
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts = [];
        this.piano.player.stopAllSounds();
    }
}

export default BasePianoTrainer;