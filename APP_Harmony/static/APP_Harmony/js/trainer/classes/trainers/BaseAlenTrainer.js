import BasePianoTrainer from "./BasePianoTrainer.js";
import {scales} from "../../../shared/constants/scales.js";

class BaseAlenTrainer extends BasePianoTrainer {
    constructor(
        presetName,
        presetCategory,
        countQuestions,
        workFieldId,
        notesDuration,
        pianoPlayer,
        cadenceName,
        playCadenceEveryNQuestion,
        cadenceOctave,
        cadenceDuration,
    ) {
        super(
            presetName,
            presetCategory,
            countQuestions,
            workFieldId,
            notesDuration,
            pianoPlayer
        );
        this.playCadenceEveryNQuestion = playCadenceEveryNQuestion;
        this.cadenceOctave = cadenceOctave;
        this.cadenceDuration = cadenceDuration;
        this.cadenceName = cadenceName;
    }
}

export default BaseAlenTrainer;