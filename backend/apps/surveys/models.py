# surveys/models.py
from adjango.models import AModel
from django.db.models import (
    Model, CharField, PositiveSmallIntegerField,
    SlugField, TextField, BooleanField, ForeignKey,
    CASCADE, TextChoices, ImageField, DateTimeField,
    ManyToManyField, SmallIntegerField
)

from apps.core.models.user import User
from apps.theme.models import Theme


class Survey(AModel):
    title = CharField(max_length=255)
    slug = SlugField(max_length=255, unique=True, blank=True, null=True)
    description = TextField(help_text='Use Markdown for formatting', blank=True, null=True)
    is_test = BooleanField(default=False)
    is_public = BooleanField(default=False)
    author = ForeignKey(User, related_name='surveys', on_delete=CASCADE)
    author_visible = BooleanField(default=False)
    theme_mode = CharField(max_length=10, choices=Theme.Mode.choices, default=Theme.Mode.LIGHT)
    bg_image = ImageField(upload_to='images/survey/background/', null=True, blank=True)
    finish_text = TextField(null=True, blank=True)

    time_limit_minutes = PositiveSmallIntegerField(null=True, blank=True)
    random_question_order = BooleanField(default=False)
    allow_answer_changes = BooleanField(default=True)
    show_total_points_at_end = BooleanField(default=True)
    show_correct_answers_at_end = BooleanField(default=False)
    show_correct_answers_after_question = BooleanField(default=False)
    attempts_allowed = PositiveSmallIntegerField(null=True, blank=True)
    author_will_see_attempts = BooleanField(default=False)

    def __str__(self):
        return self.title


class Question(AModel):
    class QuestionType(TextChoices):
        CHOICES = 'choices', 'Multiple Choice'
        TEXT = 'text', 'Text'

    survey = ForeignKey(Survey, related_name='questions', on_delete=CASCADE)
    title = CharField(max_length=255, null=True, blank=True)
    order = PositiveSmallIntegerField()
    text = TextField(help_text='Use Markdown for formatting')
    points_for_text = PositiveSmallIntegerField(default=1)
    time_limit_minutes = PositiveSmallIntegerField(null=True, blank=True)
    question_type = CharField(max_length=20, choices=QuestionType.choices)
    correct_text_answer = TextField(blank=True, null=True)
    is_required = BooleanField(default=True)

    def __str__(self):
        return self.text


class Choice(AModel):
    title = CharField(max_length=255, null=True, blank=True)
    points = SmallIntegerField(default=0)
    question = ForeignKey(Question, related_name='choices', on_delete=CASCADE)
    text = TextField(help_text='Use Markdown for formatting')
    is_correct = BooleanField(default=False)

    def __str__(self):
        return self.text


class SurveyAccess(AModel):
    survey = ForeignKey(Survey, related_name='accesses', on_delete=CASCADE)
    user = ForeignKey(User, related_name='survey_accesses', on_delete=CASCADE)
    attempts_allowed = PositiveSmallIntegerField(default=1)
    attempts_made = PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = ('survey', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.survey.title}"


class SurveyAttempt(AModel):
    survey = ForeignKey(Survey, related_name='attempts', on_delete=CASCADE)
    user = ForeignKey(User, related_name='survey_attempts', on_delete=CASCADE)
    start_time = DateTimeField(auto_now_add=True)
    end_time = DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.survey.title} - Attempt {self.id}"


class QuestionAttempt(AModel):
    attempt = ForeignKey(SurveyAttempt, related_name='question_attempts', on_delete=CASCADE)
    question = ForeignKey(Question, related_name='attempts', on_delete=CASCADE)
    start_time = DateTimeField(auto_now_add=True)
    end_time = DateTimeField(null=True, blank=True)
    selected_choices = ManyToManyField(Choice, related_name='question_attempts', blank=True)
    text_answer = TextField(null=True, blank=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text} - Attempt {self.attempt.id}"
