from django.contrib import admin
from .models import *


@admin.register(TrainerPreset)
class TrainerPresetAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'priority',
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
        'available_replay',
    ]
    list_editable = [
        'priority',
        'category',
        'scale_name',
        'scale_octave',
        'chromatic',
        'count_questions',
        'cadence_name',
        'play_cadence_every_n_question',
        'hidden_note_octave',
        'cadence_octave',
        'available_replay',
    ]
    save_on_top = True


@admin.register(TrainerPresetCategory)
class TrainerPresetCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'priority',
        'desc',
    ]
    list_editable = [
        'priority',
        'desc',
    ]
    save_on_top = True


@admin.register(TrainerPresetResult)
class TrainerPresetResultAdmin(admin.ModelAdmin):
    list_display = [
        'preset',
        'right_answer_percentage',
    ]
    save_on_top = True
