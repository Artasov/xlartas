function addOctaveToKey(key, octave) {
    return key.replace(/\d*/, '') + octave;
}

class Piano {
    constructor(start_key) {
        this.fullKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.start_index = this.fullKeys.indexOf(start_key);
        if (this.start_index === -1) {
            throw new Error(`Start key ${start_key} not found`);
        }
        this.current_keys = [];
        for (let i = 0; i < 14; i++) {
            this.current_keys.push(this.fullKeys[(this.start_index + i) % this.fullKeys.length]);
        }

        this.disabled_keys = [];

        this.pianoEl = undefined;
        this.keysEls = [];

        this.keysSounds = window.keySounds;
    }

    disableKeys(keys) {
        this.disabled_keys = keys;
    }

    enableOnlyKeys(keys) {
        this.disabled_keys = this.current_keys.filter(key => !keys.includes(key));
    }

    createPianoEl() {
        const pianoEl = document.createElement('div');
        pianoEl.classList.add('piano');

        this.current_keys.forEach((key, index) => {
            const keyEl = document.createElement('div');
            keyEl.classList.add('piano-key');
            if (key.includes('#')) {
                keyEl.classList.add('piano-key-b');
            }
            keyEl.textContent = key;
            if (this.disabled_keys.includes(key)) {
                if (key.includes('#')) {
                    keyEl.classList.add('piano-key-b-disabled');
                } else {
                    keyEl.classList.add('piano-key-disabled');
                }
            }
            pianoEl.appendChild(keyEl);
            this.keysEls.push(keyEl);
        });
        this.pianoEl = pianoEl;
        return pianoEl;
    }


    playKey(fullKey, duration = 0, index = null, hidden = false) {
        const key_without_octave = fullKey.replace(/\d/g, '');
        if (index === null) {
            index = this.current_keys.indexOf(key_without_octave);
        }
        if (this.current_keys.includes(key_without_octave) && !this.disabled_keys.includes(key_without_octave)) {
            console.log(this.keysSounds)
            console.log(fullKey)
            this.keysSounds[fullKey].play();
            if (this.keysEls) {
                const keyEl = this.keysEls[index];
                if (keyEl) {
                    if (!hidden) {
                        keyEl.classList.add('piano-key-active');
                    }
                }
                setTimeout(() => {
                    if (keyEl) {
                        keyEl.classList.remove('piano-key-active');
                    }
                }, duration);
            }
        } else {
            console.log(`Key: ${fullKey} is not available or disabled`);
        }
    }

    playFromToTonic(from_key, octave, duration = 500) {
        for (const keySound of Object.values(this.keysSounds)) {
            keySound.pause();
            keySound.currentTime = 0;
        }

        let fromIndex = this.current_keys.indexOf(from_key);
        if (fromIndex === -1) {
            console.log(`Key: ${from_key} is not available`);
            return;
        }

        const halfWay = this.current_keys.length / 2;
        let targetIndex = fromIndex < halfWay ? 0 : 12;

        const addOctaveToKey = (key, octave) => {
            return key.replace(/\d*/, '') + octave;
        };

        if (fromIndex < halfWay) {
            let timeOffset = 0;
            for (let i = fromIndex; i >= targetIndex; i--) {
                if (!this.disabled_keys.includes(this.current_keys[i])) {
                    let fullKey = addOctaveToKey(this.current_keys[i], octave);
                    setTimeout(() => this.playKey(fullKey, duration, i), duration * timeOffset);
                    timeOffset++;
                }
                if (i > targetIndex && this.current_keys[i] === 'C') {
                    octave--;
                }
            }
        } else {
            let timeOffset = 0;
            for (let i = fromIndex; i <= targetIndex; i++) {
                if (i === targetIndex && this.current_keys[i] === 'C') {
                    octave++;
                }
                if (!this.disabled_keys.includes(this.current_keys[i])) {
                    let fullKey = addOctaveToKey(this.current_keys[i], octave);
                    setTimeout(() => this.playKey(fullKey, duration, i), duration * timeOffset);
                    timeOffset++;
                }
            }
        }
    }

    playCadence(chordsProgression, octave, duration = 500) {
        let timeOffset = 0;

        for (const chord of chordsProgression) {
            setTimeout(() => {
                this.playChord(chord, octave, duration);
            }, duration * timeOffset);
            timeOffset += chord.length; // Увеличиваем смещение времени на количество нот в аккорде
        }
    }

    playChord(chord, octave, duration) {
        this.stopPlayingAll();
        for (const note of chord) {
            this.playKey(note + octave, duration, null);
        }
    }

    stopPlayingAll() {
        for (const keySound of Object.values(this.keysSounds)) {
            keySound.pause();
            keySound.currentTime = 0;
        }
    }
}