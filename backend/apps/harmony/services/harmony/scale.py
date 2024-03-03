from pychord.constants import NOTE_VAL_DICT
from pychord.constants.scales import RELATIVE_KEY_DICT

from apps.harmony.services.harmony.chord import Chord

QUALITIES_TRIADS_SEVENTHS = (
    ("", "-", "maj", "m", "min"), ("7", "M7", "maj7", "m7")
)


class Scale:
    def __init__(self, tonic: str, mode):
        # (C, D, E, ...) + (maj Dor Phr Lyd Mix min Loc)
        if tonic not in NOTE_VAL_DICT:
            raise ValueError('Wrong tonic.')
        if mode not in RELATIVE_KEY_DICT:
            raise ValueError('Wrong mode.')

        self.scale = tonic + mode
        self.tonic = tonic
        self.mode = mode

    def get_chords(self, quality: str = '', type_out=str):
        """
        :param type_out:
        :param quality: one of ("", "-", "maj", "m", "min", "7", "M7", "maj7", "m7")
        :return: tuple of is_available chords for Scale
        """
        chord_sequence = []

        for note in range(1, 8):
            chord = Chord.from_note_index(
                note=note,
                quality=quality,
                scale=self.scale,
                diatonic=True,
            )
            chord_sequence.append(
                chord.root + chord.quality.quality
                if isinstance(type_out, str)
                else chord
            )

        return tuple(chord_sequence)

# print(Scale('C', 'min').get_chords(''))
# print(Scale('C', 'min').get_chords('-'))
# print(Scale('C', 'min').get_chords('maj'))
# print(Scale('C', 'min').get_chords('m'))
# print(Scale('C', 'min').get_chords('min'))
# print(Scale('C', 'min').get_chords('7'))
# print(Scale('C', 'min').get_chords('M7'))
# print(Scale('C', 'min').get_chords('maj7'))
# print(Scale('C', 'min').get_chords('m7'))
