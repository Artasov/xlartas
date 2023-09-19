import {cadences} from '../../shared/constants/cadences.js';
import Note from "../../shared/classes/Note.js";
import {getNotesBetween} from "../../shared/shared_funcs.js";

export const trainerPresets = {
    'Major': {
        'C Major 1-2-3-4': {
            'presetName': 'C Major 1-2-3-4',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': [
                new Note('C', 4),
                new Note('D', 4),
                new Note('E', 4),
                new Note('F', 4)
            ],
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
        'C Major 5-6-7-8': {
            'presetName': 'C Major 5-6-7-8',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': [
                new Note('G', 4),
                new Note('A', 4),
                new Note('B', 4),
                new Note('C', 5)
            ],
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
        'C Major Full': {
            'presetName': 'C Major Full',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': [
                new Note('C', 4),
                new Note('D', 4),
                new Note('E', 4),
                new Note('F', 4),
                new Note('G', 4),
                new Note('A', 4),
                new Note('B', 4),
                new Note('C', 5),
            ],
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
    },
    'Chromaticism in a Major': {
        'C Major 1-Part Chromatic': {
            'presetName': 'C Major 1-Part Chromatic',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': getNotesBetween(
                new Note('C', 4),
                new Note('F', 4),
            ),
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
        'C Major 2-Part Chromatic': {
            'presetName': 'C Major 2-Part Chromatic',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': getNotesBetween(
                new Note('F#', 4),
                new Note('C', 5),
            ),
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
        'C Major Full Chromatic': {
            'presetName': 'C Major Full Chromatic',
            'presetDesc': 'desc.......',
            'pianoStartNote': new Note('C', 4),
            'enabledNotes': getNotesBetween(
                new Note('C', 4),
                new Note('C', 5),
            ),
            'countQuestions': 20,
            'cadenceName': 'AuthenticCadence',
            'playCadenceEveryNQuestion': 1,
            'hiddenKeyOctave': 5,
            'cadenceOctave': 5,
            'availableReplay': true
        },
    }
}