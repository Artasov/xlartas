from django import template

from APP_Harmony.services.Harmony.chords_progressions import accords_dict, NOTE_NAME_DICT, MODE_NAME_DICT, NOTE_TYPE, \
    AVAILABLE_QUALITY

register = template.Library()


@register.simple_tag
def get_trainer_sounds():
    return {
        'Oscillator': 'Oscillator',
        'BalladPiano': 'BalladPiano',
    }


@register.simple_tag
def get_all_qualities():
    return AVAILABLE_QUALITY


@register.simple_tag
def get_all_notes():
    return NOTE_NAME_DICT


@register.simple_tag
def get_all_modes():
    return MODE_NAME_DICT


@register.simple_tag
def get_out_sharp_or_flat_types():
    return NOTE_TYPE


@register.simple_tag
def get_accords_dict():
    return accords_dict
