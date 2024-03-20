import {createAndStartTrainer} from "./trainer_main.js";
import Scale from "../shared/classes/Scale.js";

function insertStatisticsGraphic(statistics, forInsertEl) {
    const canvas = document.createElement("canvas");
    forInsertEl.appendChild(canvas);
    let context = canvas.getContext("2d");
    const createLineChart = (xData, yData) => {
        let data = {
            labels: xData,
            datasets: [{
                label: 0,
                data: yData,
                pointStyle: false,
                fill: true,
                borderWidth: 1,
                tension: 0.4
            }]
        }
        let xScaleConfig = {
            min: 0,
            max: 50,
            ticks: {
                autoSkip: true,
                maxRotation: 0,
            }
        }
        let config = {
            type: "line",
            data: data,
            options: {
                responsive: true,
                plugins: {
                    subtitle: false,
                    legend: false,
                    tooltip: false,
                    title: false,
                },
                scales: {
                    x: {
                        // display: false,
                        ticks: {
                            autoSkip: true,
                            maxRotation: 0,
                        }
                    },
                    y: {
                        // display: false,
                        ticks: {
                            autoSkip: true,
                            maxRotation: 0,
                        }
                    }
                }
            },
        }
        let chart = new Chart(context, config)
    }

    let xData = [];
    let yData = [];
    for (let i = 0; i < statistics.length; i++) {
        xData.push(statistics[i].created_at)
        yData.push(statistics[i].right_answer_percentage)
    }
    createLineChart(xData, yData)
}

function showPresetUserStats(preset) {
    const userStats = preset.user_statistics.map(obj => {
        let newObj = {...obj};
        let date = new Date(newObj.created_at);
        let day = date.getDate();
        let month = date.getMonth() + 1; // getMonth() возвращает месяцы от 0 до 11, поэтому прибавляем 1
        newObj.created_at = `${day}.${month}`;
        return newObj;
    });

    const modalWrap = document.createElement('div');
    modalWrap.addEventListener('click', () => {
        modalWrap.remove();
    })

    modalWrap.className = 'fcc position-absolute top-0 left-0 w-100vw h-100vh';
    const modal = document.createElement('div');
    modal.style.maxWidth = '500px';
    modal.style.pointerEvents = 'all';
    modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.25)';
    modal.className = 'w-90 fcc bg-black-25 mx-auto p-4 backdrop-blur-20 rounded-4';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'frc gap-2'
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'text-white-90 mx-0 my-auto';
    modalTitle.innerHTML = preset.presetName;
    const btnClose = document.createElement('button');
    btnClose.className = 'btn-close my-auto';
    btnClose.style.filter = 'invert(0.9)';
    btnClose.addEventListener('click', () => {
        modalWrap.remove();
    })

    const modalBody = document.createElement('div');
    const modalGraphic = document.createElement('div');
    insertStatisticsGraphic(userStats, modalGraphic);


    modalWrap.appendChild(modal);
    modal.appendChild(modalHeader);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(btnClose);

    modal.appendChild(modalBody);
    modalBody.appendChild(modalGraphic);


    document.body.appendChild(modalWrap);
}

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
            type: preset.type,
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

export function populatePresetAccordion(trainerPresets, toContainerId) {

    const container = document.getElementById(toContainerId);

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
            presetSettings.className = 'mb-1 d-flex gap-2'
            const degrees = document.createElement('div');
            degrees.classList.add('degrees-wrap', 'my-auto');
            for (let i = 1; i <= 8; i++) {
                const degree = document.createElement('div');
                if (preset.degrees.indexOf(i) !== -1) {
                    degree.classList.add('degree-active');
                }
                degree.classList.add('degree')
                degrees.appendChild(degree);
            }
            presetSettings.appendChild(degrees)

            const questionCount = document.createElement('span');
            questionCount.classList.add('text-white-50', 'fs-7');
            questionCount.innerHTML = `Q<span class="text-white-80">${preset.countQuestions}</span>`
            const percentageNumber = document.createElement('span');
            percentageNumber.classList.add('text-white-50', 'fs-7');

            percentageNumber.addEventListener('click', () => {
                console.log('123')
                showPresetUserStats(preset);
            })


            presetSettings.appendChild(percentageNumber)
            presetSettings.appendChild(questionCount)

            presetTitle.appendChild(presetSpan)
            presetTitle.appendChild(presetSettings)

            const presetButton = document.createElement('button');
            presetButton.className = 'btn-start-1 my-auto';
            presetButton.style.minWidth = '45px';
            presetButton.style.height = '45px';


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
            percentageNumber.innerHTML = `<span class="text-white-80">${averagePercentage}%</span>`

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