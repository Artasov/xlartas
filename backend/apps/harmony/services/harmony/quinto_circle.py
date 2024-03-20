from pychord import Chord


class QuintoCircle:
    def __init__(self):
        self.__scales = {
            'C': ['C', 'F', 'G', 'Am', 'Dm', 'Em'],
            'G': ['G', 'C', 'D', 'Em', 'Am', 'Bm'],
            'D': ['D', 'G', 'A', 'Bm', 'Em', 'F#m'],
            'A': ['A', 'D', 'E', 'F#m', 'Bm', 'C#m'],
            'E': ['E', 'A', 'B', 'C#m', 'F#m', 'G#m'],
            'B': ['B', 'E', 'F#', 'G#m', 'C#m', 'D#m'],
            'F#': ['F#', 'B', 'C#', 'D#m', 'G#m', 'A#m'],
            'Db': ['Db', 'Gb', 'Ab', 'Bbm', 'Ebm', 'Fm'],
            'Ab': ['Ab', 'Db', 'Eb', 'Fm', 'Bbm', 'Cm'],
            'Eb': ['Eb', 'Ab', 'Bb', 'Cm', 'Fm', 'Gm'],
            'Bb': ['Bb', 'Eb', 'F', 'Gm', 'Cm', 'Dm'],
            'F': ['F', 'Bb', 'C', 'Dm', 'Gm', 'Am'],
        }

    def parallel_minor(self, tonic: str) -> str:
        pass

print(Chord('A#m').on)
print(Chord('A#m').appended)
print(Chord('A#m').components())
print(Chord('A#m').info())
print(Chord('A#m').on)
print(Chord('A#m').on)