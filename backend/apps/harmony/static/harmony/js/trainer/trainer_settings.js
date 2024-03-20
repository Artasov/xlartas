const cadenceDuration = document.getElementById('cadenceDuration');
const cadenceDurationValue = document.getElementById('cadenceDurationValue');
const notesDuration = document.getElementById('notesDuration');
const notesDurationValue = document.getElementById('notesDurationValue');

function saveSettingsToLocalStorage() {
    localStorage.setItem('cadenceDuration', cadenceDuration.value);
    localStorage.setItem('notesDuration', notesDuration.value);
}

export function loadTrainerSettings() {
    const savedCadenceDuration = localStorage.getItem('cadenceDuration');
    const savedNotesDuration = localStorage.getItem('notesDuration');

    if (savedCadenceDuration !== null) {
        cadenceDuration.value = savedCadenceDuration;
    }

    if (savedNotesDuration !== null) {
        notesDuration.value = savedNotesDuration;
    }
    cadenceDurationValue.innerText = cadenceDuration.value + 'ms';
    notesDurationValue.innerText = notesDuration.value + 'ms';


    cadenceDuration.addEventListener('input', function () {
        cadenceDurationValue.innerText = this.value + 'ms';
        saveSettingsToLocalStorage(); // Вызываем функцию сохранения при изменении
    });
    notesDuration.addEventListener('input', function () {
        notesDurationValue.innerText = this.value + 'ms';
        saveSettingsToLocalStorage(); // Вызываем функцию сохранения при изменении
    });
}




