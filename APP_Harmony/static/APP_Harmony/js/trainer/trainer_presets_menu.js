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
        const category = preset.category;
        if (!trainerPresets[category]) {
            trainerPresets[category] = {};
        }
        let scalePreset = undefined;

        trainerPresets[category][preset.name] = {
            id: preset.id,
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
            availableReplay: preset.available_replay,
            user_statistics: preset.user_statistics
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
            presetBlock.className = 'train-preset-block overflow-hidden frb gap-3 bg-black-15 rounded-3 py-2 px-3 mx-auto mb-2 position-relative';
            presetBlock.style.width = '100%';
            presetBlock.style.maxWidth = '300px';

            const presetTitle = document.createElement('div');
            presetTitle.className = 'fcc'


            const presetSpan = document.createElement('span');
            presetSpan.className = 'disable-tap-and-selection fs-6 text-white-80 my-auto';
            presetSpan.style.paddingTop = '3px';
            presetSpan.dataset.bsToggle = 'tooltip';
            presetSpan.dataset.bsPlacement = 'top';
            presetSpan.dataset.bsTitle = preset.presetDesc;
            presetSpan.textContent = preset.presetName;

            const presetSettings = document.createElement('div');
            const degrees = document.createElement('div');
            degrees.classList.add('degrees-wrap');
            for (let i = 1; i <= 8; i++) {
                console.log(i)
                console.log(preset.degrees)
                const degree = document.createElement('div');
                if (preset.degrees.indexOf(i) !== -1) {
                    console.log('Yes')
                    degree.classList.add('degree-active');
                }
                degree.classList.add('degree')
                degrees.appendChild(degree);
            }


            presetSettings.appendChild(degrees)

            presetTitle.appendChild(presetSpan)
            presetTitle.appendChild(presetSettings)

            const presetButton = document.createElement('button');
            presetButton.className = 'btn-start-1 my-auto';
            presetButton.style.minWidth = '45px';
            presetButton.style.height = '45px';


            console.log('STATISTICS')
            const presetStatsLineWrap = document.createElement('div');
            presetStatsLineWrap.className = 'position-absolute bottom-0 left-0 w-100'
            presetStatsLineWrap.style.height = '5px';

            const presetStatsLine = document.createElement('div');
            presetStatsLine.className = 'h-100 presets-stats-line'

            let total_percent_amount = 0;
            let averagePercentage = 0;

            if (preset.user_statistics.length > 0) {
                preset.user_statistics.forEach(ustats => {
                    total_percent_amount += ustats.right_answer_percentage;
                });
                averagePercentage = Math.floor(total_percent_amount / preset.user_statistics.length);
            }

            function lerp(start, end, factor) {
                return start + (end - start) * factor;
            }

// Начальный и конечный цвета в формате RGB
            const startColor = {r: 41, g: 36, b: 102}; // #292466
            const endColor = {r: 147, g: 13, b: 83};   // #930d53

// Вычислите фактор интерполяции
            let factor = averagePercentage / 100;

// Получите интерполированный цвет
            let interpolatedColor = {
                r: Math.round(lerp(startColor.r, endColor.r, factor)),
                g: Math.round(lerp(startColor.g, endColor.g, factor)),
                b: Math.round(lerp(startColor.b, endColor.b, factor))
            };

// Установите этот цвет как второй цвет в вашем градиенте
            presetStatsLine.style.background = `linear-gradient(90deg, #292466 0%, rgb(${interpolatedColor.r}, ${interpolatedColor.g}, ${interpolatedColor.b}) 100%)`;

            presetStatsLine.style.width = `${averagePercentage}%`;
            presetStatsLineWrap.appendChild(presetStatsLine);
            presetStatsLineWrap.appendChild(presetStatsLine)

            presetButton.onclick =
                () => createAndStartTrainer(presetName, preset.presetCategory);

            presetBlock.appendChild(presetTitle);
            presetBlock.appendChild(presetButton);
            presetBlock.appendChild(presetStatsLineWrap);

            presetsContainer.appendChild(presetBlock);
        }

        accordionItem.appendChild(presetsContainer);

        container.appendChild(accordionItem);

        groupIndex++;
    }
}