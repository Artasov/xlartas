from pychord import Chord as ChordBase
from pychord.constants import VAL_NOTE_DICT
from pychord.utils import note_to_val


class Chord(ChordBase):
    def get_parallel_or_self(self):
        note_value = note_to_val(self.root)
        parallel_notes = VAL_NOTE_DICT[note_value]

        if len(parallel_notes) < 2 or self.root not in parallel_notes:
            return self

        parallel_root = \
            parallel_notes[1] \
                if self.root == parallel_notes[0] \
                else parallel_notes[0]
        parallel_chord = Chord(f"{parallel_root}{self.quality.quality}")
        return parallel_chord


