function createProgressionEl(progression) {
    const progressionItem = document.createElement('div');
    progressionItem.className = 'px-3 py-1 progression-item text-center h-min w-min white-space-no-wrap frc';

// Создание текстового элемента
    const chordSpan = document.createElement('span');
    chordSpan.textContent = progression;
    progressionItem.appendChild(chordSpan);

// Создание элемента для закрытия
    const closeDiv = document.createElement('div');
    closeDiv.className = 'progression-item-close';

    const closeButton = document.createElement('div');
    closeButton.className = 'btn-close';
    closeDiv.appendChild(closeButton);
    closeButton.addEventListener('click', function () {
        if (progressionItem.classList.contains('progression-item-active')) {
            progressionItem.remove();
        }
    })

    progressionItem.appendChild(closeDiv);

    progressionItem.addEventListener('click', () => {
        progressionItem.classList.toggle('progression-item-active');
    })
    return progressionItem;
}

function createScaleProgressionsList(scale, progressions) {
    const div = document.createElement('div');
    div.classList.add('w-100');
    const titleH2 = document.createElement('h2');
    titleH2.innerText = scale;
    const progressionsListEl = document.createElement('div');
    progressionsListEl.classList.add('frc', 'flex-wrap', 'gap-2');
    for (const progression of progressions) {
        const progressionEl = createProgressionEl(progression.join(' - '));
        progressionsListEl.appendChild(progressionEl);
    }
    div.appendChild(titleH2);
    div.appendChild(progressionsListEl);
    return div;
}
