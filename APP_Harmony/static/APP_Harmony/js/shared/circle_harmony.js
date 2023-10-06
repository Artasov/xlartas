export function initCircleHarmony() {
    const harmonyCircle = document.querySelector('.harmony-circle');
    const btnShowHarmonyCircle = document.querySelector('.btn-show-harmony-circle');

    btnShowHarmonyCircle.addEventListener('click', function () {
        harmonyCircle.classList.toggle('harmony-circle-active');
    })
}
