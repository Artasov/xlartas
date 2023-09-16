const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl, {trigger: 'focus'}))

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const cadenceDuration = document.getElementById('cadenceDuration');
const cadenceDurationValue = document.getElementById('cadenceDurationValue');
const notesDuration = document.getElementById('notesDuration');
const notesDurationValue = document.getElementById('notesDurationValue');

// Функция для сохранения значений в локальное хранилище
function saveValuesToLocalStorage() {
    localStorage.setItem('cadenceDuration', cadenceDuration.value);
    localStorage.setItem('notesDuration', notesDuration.value);
}

// Функция для загрузки значений из локального хранилища или из полей ввода
function loadValuesFromLocalStorageOrInput() {
    const savedCadenceDuration = localStorage.getItem('cadenceDuration');
    const savedNotesDuration = localStorage.getItem('notesDuration');

    if (savedCadenceDuration !== null) {
        cadenceDuration.value = savedCadenceDuration;
    }

    if (savedNotesDuration !== null) {
        notesDuration.value = savedNotesDuration;
    }

    // Обновляем текстовые поля значениями из полей ввода
    cadenceDurationValue.innerText = cadenceDuration.value + 'ms';
    notesDurationValue.innerText = notesDuration.value + 'ms';
}

// Добавляем обработчики событий для сохранения значений
cadenceDuration.addEventListener('input', function () {
    cadenceDurationValue.innerText = this.value + 'ms';
    saveValuesToLocalStorage(); // Вызываем функцию сохранения при изменении
});

notesDuration.addEventListener('input', function () {
    notesDurationValue.innerText = this.value + 'ms';
    saveValuesToLocalStorage(); // Вызываем функцию сохранения при изменении
});

// Загружаем значения из локального хранилища или из полей ввода при загрузке страницы
window.addEventListener('load', function () {
    loadValuesFromLocalStorageOrInput();
});
