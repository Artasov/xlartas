import {NOTES} from "../shared/constants/notes.js";


export async function preloadSounds() {
    if (isString(window.keySounds)) {
        return;
    }
    const preloadPromises = Object.values(window.keySounds).map((sound) => {
        return new Promise((resolve) => {
            sound.volume = 0.0;
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = 1.0;
                resolve();
            }).catch((error) => {
                console.error("Audio preload failed:", error);
                resolve();
            });
        });
    });

    await Promise.all(preloadPromises);
}

export function setSoundSettings() {
    const soundInput = document.getElementById('select_input-trainer_sound');
    const selectSoundBtn = document.getElementById('select_btn-trainer_sound');
    const selectSoundItems = document.querySelectorAll('.select_menu-trainer_sound-item')

    const audioContainer = document.querySelector('.audioContainer');
    const octaves = [3, 4, 5, 6];

    const savedSoundSelection = localStorage.getItem('savedSoundSelection');
    if (savedSoundSelection) {
        selectSoundItems.forEach(selectSoundItem => {
            const selectText = selectSoundItem.children[0].textContent.trim();
            if (selectText === savedSoundSelection) {
                selectSoundBtn.click();
                selectSoundItem.click();
            }
        })
    }

    function setSounds() {
        if (soundInput.value === 'Oscillator') {
            window.keySounds = soundInput.value;
            return;
        }
        const audioFiles = {};
        octaves.forEach(octave => {
            NOTES.forEach(note => {
                const audio = new Audio(`/static/APP_Harmony/mp3/${soundInput.value}/${encodeURIComponent(note)}${octave}.mp3`);
                audio.preload = 'auto';
                audioFiles[note + octave] = audio;
            });
        });
        window.keySounds = audioFiles;
    }

    selectSoundItems.forEach(selectSoundItem => {
        selectSoundItem.addEventListener('click', () => {
            localStorage.setItem('savedSoundSelection', soundInput.value);
            setSounds();
        });
    })


    setSounds();
}