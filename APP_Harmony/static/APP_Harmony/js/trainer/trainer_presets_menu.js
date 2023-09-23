import {createAndStartTrainer} from "./trainer_main.js";
import Scale from "../shared/classes/Scale.js";


export async function fetchTrainerPresets() {
    const response = await fetch('/harmony/trainer/base_presets/');

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const trainerPresets = {};

    for (const preset of data) {
        const category = preset.category.name;
        if (!trainerPresets[category]) {
            trainerPresets[category] = {};
        }
        let scalePreset = undefined;

        trainerPresets[category][preset.name] = {
            presetName: preset.name,
            presetCategory: preset.category,
            presetDesc: preset.desc,
            scaleName: preset.scale_name,
            scaleOctave: preset.scale_octave,
            degrees: preset.degrees,
            chromatic: preset.chromatic,
            hiddenNoteOctave: preset.hidden_note_octave,
            countQuestions: preset.count_questions,
            cadenceName: preset.cadence_name,
            playCadenceEveryNQuestion: preset.play_cadence_every_n_question,
            cadenceOctave: preset.cadence_octave,
            availableReplay: preset.available_replay
        };
    }

    return trainerPresets;
}

export function populatePresetAccordion(trainerPresets) {

    const container = document.getElementById('trainer-presets-container');

    let groupIndex = 1;
    for (const category in trainerPresets) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'trainer-presets-group accordion-item';

        const h2 = document.createElement('h2');
        h2.className = 'accordion-header';

        const button = document.createElement('button');
        button.className = 'accordion-button';
        button.type = 'button';
        button.dataset.bsToggle = 'collapse';
        button.dataset.bsTarget = `#panelsStayOpen-collapse${groupIndex}`;
        button.setAttribute('aria-expanded', groupIndex === 1 ? 'true' : 'false');
        button.setAttribute('aria-controls', `panelsStayOpen-collapse${groupIndex}`);

        const span = document.createElement('span');
        span.className = 'w-100 mb-0 fs-5';
        span.textContent = category;

        button.appendChild(span);
        h2.appendChild(button);
        accordionItem.appendChild(h2);

        const presetsContainer = document.createElement('div');
        presetsContainer.id = `panelsStayOpen-collapse${groupIndex}`;
        presetsContainer.className = 'collapse';
        presetsContainer.setAttribute('data-bs-parent', '#trainer-presets-container')
        presetsContainer.className += groupIndex === 1 ? ' show' : '';

        for (const presetName in trainerPresets[category]) {
            const preset = trainerPresets[category][presetName];

            const presetBlock = document.createElement('div');
            presetBlock.className = 'train-preset-block frb gap-3 bg-black-15 rounded-3 py-2 px-3 mx-auto mb-2';
            presetBlock.style.width = '100%';
            presetBlock.style.maxWidth = '300px';

            const presetSpan = document.createElement('span');
            presetSpan.className = 'disable-tap-and-selection fs-6 text-white-80 my-auto white-space-no-wrap';
            presetSpan.style.paddingTop = '3px';
            presetSpan.dataset.bsToggle = 'tooltip';
            presetSpan.dataset.bsPlacement = 'top';
            presetSpan.dataset.bsTitle = preset.presetDesc;
            presetSpan.textContent = preset.presetName;

            const presetButton = document.createElement('button');
            presetButton.className = 'btn-start-1 my-auto';
            presetButton.style.width = '45px';
            presetButton.style.height = '45px';

            // START TRAINER BUTTON
            presetButton.onclick =
                () => createAndStartTrainer(presetName, category);

            presetBlock.appendChild(presetSpan);
            presetBlock.appendChild(presetButton);

            presetsContainer.appendChild(presetBlock);
        }

        accordionItem.appendChild(presetsContainer);

        container.appendChild(accordionItem);

        groupIndex++;
    }
}