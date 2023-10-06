import Note from "../shared/classes/Note.js";
import Chord from "../shared/classes/Chord.js";
import OscillatorPianoPlayer from "./classes/pianos/OscillatorPianoPlayer.js";
import {loadTrainerSettings} from "./trainer_settings.js";
import {initCircleHarmony} from "../shared/circle_harmony.js";
import {fetchTrainerPresets, populatePresetAccordion} from "./trainer_presets_menu.js";
import PredictNoteAlenTrainer from "./classes/trainers/PredictNoteAlenTrainer.js";
import {getNotesBetween, getRandomScaleName} from "../shared/shared_funcs.js";
import Scale from "../shared/classes/Scale.js";
import AudioPianoPlayer from "./classes/pianos/AudioPianoPlayer.js";
import {preloadSounds, setSoundSettings} from "./trainerSounds.js";
import PredictNoteAlenTrainerForListen from "./classes/trainers/PredictNoteAlenTrainerForListen.js";

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl, {trigger: 'focus'}))

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const signInPromoteEl = document.getElementById('signin_promote');

const trainerPresetsContainer = document.getElementById('trainer-presets-container');
const workFieldId = 'trainer-play-field';
const trainerPlayField = document.getElementById(workFieldId);

const trainerSoundsMenu = document.getElementById('select-trainer_sounds');

let currentTrainer = null;
let trainerPresetsAll = undefined;

setSoundSettings();
window.addEventListener('load', function () {
    loadTrainerSettings();
    initCircleHarmony();
    (async () => {
        trainerPresetsAll = await fetchTrainerPresets();
        console.log(trainerPresetsAll)
        populatePresetAccordion(trainerPresetsAll, 'trainer-presets-container');
    })();
});
window.addEventListener('resultNotSaved', () => {
    signInPromoteEl.classList.remove('d-none');
});
window.addEventListener('trainerStart', () => {
    trainerPresetsContainer.classList.add('d-none');
    trainerPresetsContainer.innerHTML = '';
});

window.addEventListener('trainerExit', () => {
    trainerPresetsContainer.classList.remove('d-none');
    (async () => {
        trainerPresetsAll = await fetchTrainerPresets();
        populatePresetAccordion(trainerPresetsAll, 'trainer-presets-container');
    })();
    trainerPlayField.innerHTML = ''
});


export function createAndStartTrainer(presetName, presetCategory) {
    let pianoPlayer;
    if (window.keySounds === 'Oscillator') {
        pianoPlayer = new OscillatorPianoPlayer();
    } else {
        preloadSounds();
        pianoPlayer = new AudioPianoPlayer(window.keySounds);
    }

    const currentPreset = trainerPresetsAll[presetCategory][presetName];
    const currentPresetType = currentPreset.type;
    if (currentPresetType === 'PredictNoteAlen') {
        currentTrainer = new PredictNoteAlenTrainer(
            currentPreset,
            workFieldId,
            pianoPlayer,
            800, 450, 900, 500
        );
        setTimeout(() => {
            currentTrainer.start();
        }, 200);
    }
    else if (currentPresetType === 'PredictNoteAlenForListen'){
        currentTrainer = new PredictNoteAlenTrainerForListen(
            currentPreset,
            workFieldId,
            pianoPlayer,
            800, 450, 900, 500
        );
        setTimeout(() => {
            currentTrainer.start();
        }, 200);
    }


}


