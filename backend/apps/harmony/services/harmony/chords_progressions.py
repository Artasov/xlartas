import json
import os
from itertools import product
from typing import Tuple
from django.conf import settings
from pychord import ChordProgression
from pychord.constants import VAL_NOTE_DICT
from pychord.constants.scales import RELATIVE_KEY_DICT

from apps.harmony.services.harmony.scale import Scale

scales = (
    'C', 'Am', 'G', 'Em', 'D', 'Bm',
    'A', 'F#m', 'E', 'C#m', 'B', 'Cb',
    'G#m', 'Gb', 'F#', 'Ebm', 'Db',
    'C#', 'Bbm', 'Ab', 'Fm', 'Eb',
    'Cm', 'Bb', 'Gm', 'F', 'Dm',
)

MODE_NAME_DICT = {
    'maj': 'maj',
    'Dor': 'Dor',
    'Phr': 'Phr',
    'Lyd': 'Lyd',
    'Mix': 'Mix',
    'min': 'min',
    'Loc': 'Loc',
}
NOTE_NAME_DICT = {
    'Ab': 'Ab',
    'A': 'A',
    'A#': 'A#',
    'Bb': 'Bb',
    'B': 'B',
    'Cb': 'Cb',
    'C': 'C',
    'C#': 'C#',
    'Db': 'Db',
    'D': 'D',
    'D#': 'D#',
    'Eb': 'Eb',
    'E': 'E',
    'F': 'F',
    'F#': 'F#',
    'Gb': 'Gb',
    'G': 'G',
    'G#': 'G#',
}

NOTE_TYPE = {
    'sharp': 'sharp',
    'flat': 'flat',
    'both': 'both',
}

AVAILABLE_QUALITY = {
    'base': 'base',
    'base7': 'base7'
}

accords_dict = {
    'C': 'C',
    'C#/Db': 'C#/Db',
    'D': 'D',
    'D#/Eb': 'D#/Eb',
    'E': 'E',
    'F': 'F',
    'F#/Gb': 'F#/Gb',
    'G': 'G',
    'G#/Ab': 'G#/Ab',
    'A': 'A',
    'A#/Bb': 'A#/Bb',
    'B': 'B',
    'Cm': 'Cm',
    'C#m/Dbm': 'C#m/Dbm',
    'Dm': 'Dm',
    'D#m/Ebm': 'D#m/Ebm',
    'Em': 'Em',
    'Fm': 'Fm',
    'F#m/Gbm': 'F#m/Gbm',
    'Gm': 'Gm',
    'G#m/Abm': 'G#m/Abm',
    'Am': 'Am',
    'A#m/Bbm': 'A#m/Bbm',
    'Bm': 'Bm',
}


def get_unique_progression(progressions):
    unique = []
    for progression in progressions:
        p_ = ChordProgression(list(progression))
        if p_ not in unique:
            unique.append(p_)
    return tuple(tuple(str(chord.root + chord.quality.quality) for chord in progression) for progression in unique)


def extract_progressions_from_dict(data):
    if isinstance(data, dict):
        leaf_values = []
        for value in data.values():
            leaf_values.extend(extract_progressions_from_dict(value))
        return leaf_values
    elif isinstance(data, list) and not isinstance(data[0], str):
        leaf_values = []
        for item in data:
            leaf_values.extend(extract_progressions_from_dict(item))
        return leaf_values
    else:
        return [data]


def get_all_files_in_directory(path):
    file_paths = []
    for root, _, files in os.walk(path):
        for file in files:
            file_paths.append(os.path.join(root, file))
    return file_paths


def get_values_by_template(template, listLists):
    result = []

    for inner_list in listLists:
        current_result = []
        for i, element in enumerate(template):
            if element == '*':
                current_result.append(inner_list[i])
            else:
                current_result.append(element)
        result.append(current_result)

    return result


class ChordsProgressionsGenerator:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    prerender_data_path = str(settings.BASE_DATA_DIR / 'prerender_data/').replace('\\', '/')+'/'
    scales_chords_combinations_detailed_dict = prerender_data_path + 'progressions.json'
    scales_chords_combinations_detailed_dirs_dict_primary = prerender_data_path + 'scales_chords_combinations_detailed_dirs_dict/'
    scales_chords_combinations_detailed_dirs_dict = scales_chords_combinations_detailed_dirs_dict_primary + \
                                                    'tonic_{}/mode_{}/len_{}/max_repeats_{}/quality_{}/dim_{}/progressions.json'
    list_chords_combinations_for_each_scale = prerender_data_path + 'list_chords_combinations_for_each_scale.json'
    dict_scales_chords_combinations = prerender_data_path + 'dict_scales_chords_combinations.json'

    def get_list_chords_combinations_for_each_scale(self) -> Tuple[tuple]:
        dir_save_path = '/'.join(self.list_chords_combinations_for_each_scale.split('/')[0:-1])
        os.makedirs(dir_save_path, exist_ok=True)
        if os.path.exists(self.list_chords_combinations_for_each_scale):
            with open(self.list_chords_combinations_for_each_scale, "r") as json_file:
                return json.load(json_file)

        result = tuple(extract_progressions_from_dict(self.get_scales_chords_combinations_detailed_dict()))
        result_with_tuples = map(tuple, result)
        result_set = set(result_with_tuples)
        result_set_with_tuples = map(tuple, result_set)
        uniques_tuple = tuple(result_set_with_tuples)

        with open(self.list_chords_combinations_for_each_scale, "w") as json_file:
            json.dump(uniques_tuple, json_file)
        return uniques_tuple

    def get_dict_scales_chords_combinations(self) -> dict:
        file_save_path = self.dict_scales_chords_combinations
        dir_save_path = '/'.join(file_save_path.split('/')[0:-1])
        os.makedirs(dir_save_path, exist_ok=True)
        if os.path.exists(file_save_path):
            with open(file_save_path, "r") as json_file:
                return json.load(json_file)

        chords_combinations_for_each_scale = self.get_scales_chords_combinations_detailed_dict()
        result = {}
        for scale_name, progressions in chords_combinations_for_each_scale.items():
            scale_progressions = tuple(extract_progressions_from_dict(progressions))
            scale_progressions_with_tuples = map(tuple, scale_progressions)
            scale_progressions_set = set(scale_progressions_with_tuples)
            scale_progressions_set_with_tuples = map(tuple, scale_progressions_set)
            scale_progressions_uniques_tuple = tuple(scale_progressions_set_with_tuples)
            result[scale_name] = scale_progressions_uniques_tuple

        with open(file_save_path, "w") as json_file:
            json.dump(result, json_file)
        return result

    def get_scales_chords_combinations_detailed_dict(self, progressions_len: int = 4) -> dict:
        dir_save_path = '/'.join(self.scales_chords_combinations_detailed_dict.split('/')[0:-1])
        os.makedirs(dir_save_path, exist_ok=True)
        if os.path.exists(self.scales_chords_combinations_detailed_dict):
            with open(self.scales_chords_combinations_detailed_dict, "r") as json_file:
                return json.load(json_file)

        result = {}
        for n, notes in VAL_NOTE_DICT.items():
            for note in notes:
                if not result.get(note): result[note] = {}
                for mode, mode_intervals in RELATIVE_KEY_DICT.items():
                    if not result.get(note).get(mode): result[note][mode] = {}
                    for quality in (('maj_quality', 'maj'), ('min_quality', '7')):
                        if not result.get(note).get(mode).get(quality[0]):
                            result[note][mode][quality[0]] = {}
                        for length in range(3, progressions_len + 1):
                            if not result.get(note).get(mode).get(quality[0]).get(length):
                                result[note][mode][quality[0]][length] = {}
                            for max_repeats in range(1, progressions_len + 1):
                                if not result.get(note).get(mode).get(quality[0]).get(length).get(max_repeats):
                                    result[note][mode][quality[0]][length][max_repeats] = {}
                                combinations_scale_chords = self.get_scale_chords_combinations(
                                    tonic=note,
                                    mode=mode,
                                    progressions_len=length,
                                    max_repeats=max_repeats,
                                    quality=quality[1],
                                    dim=True
                                )
                                combinations_scale_chords_no_dim = self.get_scale_chords_combinations(
                                    tonic=note,
                                    mode=mode,
                                    progressions_len=length,
                                    max_repeats=max_repeats,
                                    quality=quality[1],
                                    dim=False
                                )
                                print(note, mode, quality[0],[length],[max_repeats], sep='|')
                                result[note][mode][quality[0]][length][max_repeats]['progressions'] \
                                    = combinations_scale_chords
                                result[note][mode][quality[0]][length][max_repeats]['progressions_no_dim'] \
                                    = combinations_scale_chords_no_dim
                break  # only one of # b generating
        with open(self.scales_chords_combinations_detailed_dict, "w") as json_file:
            json.dump(result, json_file)
        return result

    def get_chords_combinations_by_template(self, template: tuple, mode='maj', quality='base', dim=False,
                                            out_sharp_or_flat='sharp') -> dict:
        """
        Generate all chords combination by template with is_available scales.
        :param template: Chords progression template like: tuple('', 'Am', 'Dm', '')
        :return: {'scale1': [chords for is_available scale1 by template], 'scale2': [chords...scale2...]}
        """
        result = {}

        if quality == 'base':
            quality = 'maj'
        elif quality == 'base7':
            quality = 7
        else:
            raise ValueError('Wrong quality.')

        progressions_len = len(template)
        template = tuple(chord.split('/')[0] for chord in template)

        all_files = get_all_files_in_directory(self.scales_chords_combinations_detailed_dirs_dict_primary)
        filtered_files = [
            item for item in all_files
            if f'len_{progressions_len}' in item
               and f'mode_{mode}' in item
               and f'quality_{quality}' in item
               and f'dim_{int(dim)}' in item
        ]
        for file_path in filtered_files:
            with open(file_path, "r") as json_file:
                path_parts = str(file_path).replace('\\', '/').split('/')
                tonic = next((part.replace('tonic_', '') for part in path_parts if part.startswith('tonic')),
                             'Undefined tonic')
                if '#' in tonic and out_sharp_or_flat == 'flat':
                    continue
                elif 'b' in tonic and out_sharp_or_flat == 'sharp':
                    continue

                list_progressions_uniques_tuple = {tuple(sublist) for sublist in json.load(json_file)}
                scale_name = f'{tonic}{mode}'
                if not result.get(scale_name):
                    result[scale_name] = []
                result[scale_name].extend(get_values_by_template(template, list_progressions_uniques_tuple))

        for scale_name, progressions in result.items():
            result[scale_name] = get_unique_progression(progressions)

        return result

    def get_scale_chords_combinations(self, tonic: str, mode: str,
                                      progressions_len, max_repeats: int = 2,
                                      quality: str = 'maj', out_sharp_or_flat: str = 'sharp',
                                      dim: bool = True) -> Tuple[Tuple[str, ...]]:
        if quality == 'base':
            quality = 'maj'
        elif quality == 'base7':
            quality = '7'

        file_save_path = self.scales_chords_combinations_detailed_dirs_dict.format(
            tonic, mode, progressions_len, max_repeats, quality, int(dim))
        dir_save_path = '/'.join(file_save_path.split('/')[0:-1])
        os.makedirs(dir_save_path, exist_ok=True)
        if os.path.exists(file_save_path):
            with open(file_save_path, "r") as json_file:
                return json.load(json_file)

        scale = Scale(tonic, mode)
        available_chords = scale.get_chords(quality=quality)

        all_combinations = self.get_chords_combinations(
            available_chords, progressions_len, max_repeats)

        if not dim:
            all_combinations = tuple(combination for combination in all_combinations if
                                     not any('dim' in chord for chord in combination))

        with open(file_save_path, "w") as json_file:
            json.dump(all_combinations, json_file)
        return all_combinations

    @staticmethod
    def get_chords_combinations(chords,
                                length: int, max_repeats: int = 2) -> Tuple[Tuple[str]]:
        unique_chords = set(chord.chord for chord in chords)
        all_scale_chords = tuple(product(unique_chords, repeat=length))

        combinations = [
            chords_tuple
            for chords_tuple in all_scale_chords
            if all(chords_tuple.count(chord) <= max_repeats for chord in set(chords_tuple))
        ]

        return get_unique_progression(tuple(combinations))


# a = ChordsProgressionsGenerator().get_chords_combinations_by_template(
#     template=('*', 'Am', 'D#', '*'))
# print(a)

# print(ChordsProgressionsGenerator().get_scale_chords_combinations('A', 'min', 4))
# print(ChordsProgressionsGenerator().get_scales_chords_combinations_detailed_dict(4))
