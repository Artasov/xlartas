from pydub import AudioSegment
import numpy as np


def parseWavToNotesMp3Files(source_path, out_path, note_duration_ms, octave_from, octave_to):
    audio = AudioSegment.from_wav(source_path)

    notes = [f"{note}{octave}" for octave in range(octave_from, octave_to)
             for note in ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]]

    print(f'{notes=}')
    print(f'{len(notes)=}')
    print(f'{len(notes) * note_duration_ms=}')
    print(f'{len(audio)=}')

    if len(notes) * note_duration_ms > len(audio):
        raise ValueError("The audio file is too short for the specified number of notes")

    for i, note_name in enumerate(notes):
        start_ms = i * note_duration_ms
        end_ms = (i + 1) * note_duration_ms
        note_segment = audio[start_ms:end_ms]
        note_segment.export(f"{out_path}/{note_name}.mp3", format="mp3", bitrate="64k")


parseWavToNotesMp3Files(
    source_path='BalladPiano/fulls/short.wav',
    out_path='BalladPiano',
    note_duration_ms=8000,
    octave_from=2,
    octave_to=8,
)
