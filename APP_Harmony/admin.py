from django.contrib import admin
from .models import *


@admin.register(TrainerPreset)
class TrainerPresetAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'desc',
        'scale_name',
        'scale_octave',
        'degrees',
        'chromatic',
        'count_questions',
        'cadence_name',
        'play_cadence_every_n_question',
        'hidden_note_octave',
        'cadence_octave',
        'available_replay'
    ]
    list_editable = [
        'category',
        'desc',
        'scale_name',
        'scale_octave',
        'degrees',
        'chromatic',
        'count_questions',
        'cadence_name',
        'play_cadence_every_n_question',
        'hidden_note_octave',
        'cadence_octave',
        'available_replay'
    ]
    save_on_top = True


@admin.register(TrainerPresetCategory)
class TrainerPresetCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'desc',
    ]
    list_editable = [
        'desc',
    ]
    save_on_top = True
