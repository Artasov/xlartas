import Note from "../shared/classes/Note.js";
import Chord from "../shared/classes/Chord.js";
import OscillatorPianoPlayer from "./classes/pianos/OscillatorPianoPlayer.js";
import {loadTrainerSettings} from "./trainer_settings.js";
import {initCircleHarmony} from "../shared/circle_harmony.js";
import {populatePresetAccordion} from "./trainer_presets_menu.js";
import {trainerPresets} from "./constants/trainer_presets.js";
import PredictNoteAlenTrainer from "./classes/trainers/PredictNoteAlenTrainer.js";
import {getNotesBetween} from "../shared/shared_funcs.js";

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
document.addEventListener('DOMContentLoaded', populatePresetAccordion);

window.addEventListener('trainerStart', () => {
    trainerPresetsContainer.classList.add('d-none');
    trainerSoundsMenu.classList.add('d-none');
});

window.addEventListener('trainerExit', () => {
    trainerPresetsContainer.classList.remove('d-none');
    trainerSoundsMenu.classList.remove('d-none');
});

export function createAndStartTrainer(presetName, presetCategory) {
    trainerPlayField.innerHTML = ''
    if (!isSoundsPreloaded) {
        // preloadSounds();
        isSoundsPreloaded = true;
    }
    const pianoPlayer = new OscillatorPianoPlayer()
    currentTrainer = new PredictNoteAlenTrainer(
        presetName,
        presetCategory,
        workFieldId,
        pianoPlayer,
        500,
        500
    );
    setTimeout(() => {
        currentTrainer.start();
    }, 200);
}


// document.querySelector('h1').addEventListener('click', () => {
//     const player = new OscillatorPianoPlayer();
//     const noteC4 = new Note('D', 4);
//     const noteE4 = new Note('F', 4);
//     const noteG4 = new Note('A', 4);
//
//     const chordEm = new Chord('Em');
//     //player.playChord(chordEm.notes, 3000);
//     // player.playNote(noteC4, 500);
//     // player.playFromTo(noteC4, noteG4, 300, 3500);
//     // player.playChord([noteC4, noteE4, noteG4], 3000);
//     player.playNotesProgression(
//         [noteC4, noteE4, noteG4, noteC4, noteE4, noteG4, noteG4, noteE4, noteC4,],
//         500,
//         2000
//     )
// })
