import Note from "../shared/classes/Note.js";
import Chord from "../shared/classes/Chord.js";
import OscillatorPianoPlayer from "./classes/pianos/OscillatorPianoPlayer.js";
import {loadTrainerSettings} from "./trainer_settings.js";
import {initCircleHarmony} from "../shared/circle_harmony.js";
import {fetchTrainerPresets, populatePresetAccordion} from "./trainer_presets_menu.js";
import PredictNoteAlenTrainer from "./classes/trainers/PredictNoteAlenTrainer.js";
import {getNotesBetween, getRandomScaleName} from "../shared/shared_funcs.js";
import Scale from "../shared/classes/Scale.js";

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl, {trigger: 'focus'}))

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const trainerPresetsContainer = document.getElementById('trainer-presets-container');
const workFieldId = 'trainer-play-field';
const trainerPlayField = document.getElementById(workFieldId);

const trainerSoundsMenu = document.getElementById('select-trainer_sounds');

let currentTrainer = null;
let isSoundsPreloaded = false;

window.addEventListener('load', function () {
    loadTrainerSettings();
    initCircleHarmony();
});
window.addEventListener('trainerStart', () => {
    trainerPresetsContainer.classList.add('d-none');
    trainerSoundsMenu.classList.add('d-none');
});

window.addEventListener('trainerExit', () => {
    trainerPresetsContainer.classList.remove('d-none');
    trainerSoundsMenu.classList.remove('d-none');
});
let trainerPresetsAll = undefined;
(async () => {
    trainerPresetsAll = await fetchTrainerPresets();
    populatePresetAccordion(trainerPresetsAll);
})();

export function createAndStartTrainer(presetName, presetCategory) {
    trainerPlayField.innerHTML = ''
    if (!isSoundsPreloaded) {
        // preloadSounds();
        isSoundsPreloaded = true;
    }
    const pianoPlayer = new OscillatorPianoPlayer()
    const currentPreset = trainerPresetsAll[presetCategory][presetName];

    currentTrainer = new PredictNoteAlenTrainer(
        currentPreset,
        workFieldId,
        pianoPlayer,
        500,
        500
    );
    setTimeout(() => {
        currentTrainer.start();
    }, 200);
}



