let progressionTemplate = document.getElementById('progression_template')


function makeSortable() {
    new Sortable(progressionTemplate, {
        animation: 150,
    });
}

function addChord(chordValue) {
    const chordBox = document.createElement('div');
    chordBox.classList.add('chord-box', 'chord-box-active');
    if (chordValue === '*') {
        chordBox.classList.add('fs-1');
        chordBox.style.paddingTop = '0.43em';
    }
    chordBox.innerText = chordValue;
    chordBox.setAttribute('draggable', 'true')

    progressionTemplate.appendChild(chordBox);
}

document.addEventListener('DOMContentLoaded', function () {
    makeSortable();
});

let current_touch_start;
let current_touch_end;

function compareAndRemoveElement() {
    if (!current_touch_start && !current_touch_end) return;
    const elementStart = document.elementFromPoint(
        current_touch_start[0], current_touch_start[1]
    );
    if (!elementStart.classList.contains('chord-box')) return;
    if (Math.abs(current_touch_start[1] - current_touch_end[1]) > 50) {
        elementStart.remove();
    }
}

document.addEventListener('touchstart', (event) => {
    current_touch_start = [
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY,
    ]
})
document.addEventListener('touchend', (event) => {
    current_touch_end = [
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY,
    ]
    compareAndRemoveElement()
})
document.addEventListener('mousedown', (event) => {
    current_touch_start = [
        event.clientX,
        event.clientY,
    ]
})
document.addEventListener('mouseup', (event) => {
    current_touch_end = [
        event.clientX,
        event.clientY,
    ]
    compareAndRemoveElement()
})
// request
// CBT chords by template
let form_CBT = document.querySelector('#chords_by_template_form')
let btn_CBT_submit = form_CBT.querySelector('.submit')
const inputs_CBT = form_CBT.querySelectorAll('input')
const error_field_CBT = form_CBT.querySelector('.error_field')
const result_container_CBT = form_CBT.querySelector('.result_container')
const btn_close_result_container_close_CBT = result_container_SCC.querySelector('button').cloneNode()
btn_CBT_submit.addEventListener('click', (e) => {
    e.preventDefault();

    const chords_els = progressionTemplate.children;
    if (chords_els.length < 2) return;
    error_field_CBT.innerHTML = '';

    let chords = [];
    for (let i = 0; i < chords_els.length; i++) {
        chords.push(chords_els[i].innerText.replace('/', '|'));
    }
    for (let i = 0; i < inputs_CBT.length; i++) {
        if (inputs_CBT[i].value === '') {
            error_field_CBT.innerHTML = 'Не все поля заполнены.'
            return;
        }
    }


    const template = encodeURIComponent(chords.join('_'))
    const inputModeValue = inputs_CBT[0].value
    const inputQualityValue = inputs_CBT[1].value
    const inputDimValue = inputs_CBT[2].checked ? 1 : 0
    const inputOutTypeValue = encodeURIComponent(inputs_CBT[3].value)
    const apiUrl =
        `/harmony/get_chords_combinations_by_template/${template}/${inputModeValue}/${inputQualityValue}/${inputDimValue}/${inputOutTypeValue}/`

    sendGetRequest(apiUrl, function (error, response) {
        if (error) {
            error_field_CBT.innerHTML = error;
        } else {
            const chordProgressions = JSON.parse(response);
            result_container_CBT.innerHTML = '';
            result_container_CBT.appendChild(btn_close_result_container_close_CBT);
            for (const key in chordProgressions) {
                const scaleProgressionsList = createScaleProgressionsList(key, chordProgressions[key])
                result_container_CBT.appendChild(scaleProgressionsList)
            }
            result_container_CBT.classList.remove('d-none')

        }
    });
})
btn_close_result_container_close_CBT.addEventListener('click', (e) => {
    e.preventDefault();
    result_container_CBT.innerHTML = '';
    result_container_CBT.classList.add('d-none')
})
