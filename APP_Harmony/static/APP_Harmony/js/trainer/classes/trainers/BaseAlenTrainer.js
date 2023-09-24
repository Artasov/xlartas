import BasePianoTrainer from "./BasePianoTrainer.js";
import {scales} from "../../../shared/constants/scales.js";

class BaseAlenTrainer extends BasePianoTrainer {
    constructor(
        presetName,
        presetCategory,
        countQuestions,
        workFieldId,
        notesDuration,
        notesInterval,
        pianoPlayer,
        cadenceName,
        playCadenceEveryNQuestion,
        cadenceOctave,
        cadenceDuration,
        cadenceInterval,
    ) {
        super(
            presetName,
            presetCategory,
            countQuestions,
            workFieldId,
            notesDuration,
            notesInterval,
            pianoPlayer
        );
        this.playCadenceEveryNQuestion = playCadenceEveryNQuestion;
        this.cadenceOctave = cadenceOctave;
        this.cadenceDuration = cadenceDuration;
        this.cadenceInterval = cadenceInterval;
        this.cadenceName = cadenceName;
    }
}

export default BaseAlenTrainer;