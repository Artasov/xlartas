# surveys/admin.py
from django.contrib import admin

from .models import Survey, Question, Choice, SurveyAccess, SurveyAttempt, QuestionAttempt


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author', 'is_test',
        'is_public', 'author_visible',
        'random_question_order',
        'time_limit_minutes',
        'theme_mode', 'slug'
    )
    list_filter = (
        'is_test', 'is_public', 'author_visible',
        'random_question_order', 'theme_mode'
    )
    search_fields = ('title', 'description', 'author__username')
    readonly_fields = ('slug',)

    fieldsets = (
        (None, {
            'fields': (
                'title', 'slug', 'description', 'author',
                'time_limit_minutes', 'random_question_order', 'is_test',
                'is_public', 'author_visible', 'theme_mode', 'bg_image'
            )
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        'survey', 'title', 'order', 'question_type',
        'points_for_text', 'time_limit_minutes', 'is_required'
    )
    list_filter = ('survey', 'question_type', 'is_required')
    search_fields = ('title', 'text', 'survey__title')
    ordering = ('survey', 'order')

    fieldsets = (
        (None, {
            'fields': (
                'survey', 'title', 'order', 'text', 'points',
                'minutes_to_complete', 'question_type', 'is_required'
            )
        }),
    )


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('question', 'points', 'text', 'is_correct')
    list_filter = ('question', 'points', 'is_correct')
    search_fields = ('text', 'question__text')

    fieldsets = (
        (None, {
            'fields': ('question', 'text', 'is_correct')
        }),
    )


@admin.register(SurveyAccess)
class SurveyAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'survey', 'attempts_allowed', 'attempts_made')
    search_fields = ('user__username', 'survey__title')
    list_filter = ('survey',)
    raw_id_fields = ('user', 'survey')


@admin.register(SurveyAttempt)
class SurveyAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'survey', 'start_time', 'end_time')
    search_fields = ('user__username', 'survey__title')
    list_filter = ('survey', 'start_time', 'end_time')
    raw_id_fields = ('user', 'survey')


@admin.register(QuestionAttempt)
class QuestionAttemptAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'start_time', 'end_time')
    search_fields = ('attempt__user__username', 'question__text')
    list_filter = ('attempt__survey', 'start_time', 'end_time')
    raw_id_fields = ('attempt', 'question')
    filter_horizontal = ('selected_choices',)
