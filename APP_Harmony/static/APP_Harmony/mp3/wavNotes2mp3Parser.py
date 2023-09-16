from pydub import AudioSegment
import numpy as np

# Загрузите ваш WAV файл
audio = AudioSegment.from_wav("BalladPiano-m/fulls/medium.wav")

# Длительность каждой ноты в миллисекундах (4 секунды = 4000 миллисекунд)
note_duration_ms = 8000

# Создайте список названий всех нот от C2 до C9
notes = [f"{note}{octave}" for octave in range(2, 9) for note in ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]]

print(f'{notes=}')
print(f'{len(notes)=}')
print(f'{len(notes) * note_duration_ms=}')
print(f'{len(audio)=}')

# Убедитесь, что у вас достаточно нот
if len(notes) * note_duration_ms > len(audio):
    raise ValueError("The audio file is too short for the specified number of notes")

# Разделите аудиофайл на отдельные сегменты и сохраните их как MP3
for i, note_name in enumerate(notes):
    start_ms = i * note_duration_ms
    end_ms = (i + 1) * note_duration_ms
    note_segment = audio[start_ms:end_ms]
    note_segment.export(f"BalladPiano-m/{note_name}.mp3", format="mp3")

print("The notes have been successfully split and saved as MP3 files")