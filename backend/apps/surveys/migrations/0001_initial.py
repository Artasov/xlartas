# Generated by Django 5.0.6 on 2024-12-01 15:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('order', models.PositiveSmallIntegerField()),
                ('text', models.TextField(help_text='Use Markdown for formatting')),
                ('points_for_text', models.PositiveSmallIntegerField(default=1)),
                ('time_limit_minutes', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('question_type', models.CharField(choices=[('choices', 'Multiple Choice'), ('text', 'Text')], max_length=20)),
                ('correct_text_answer', models.TextField(blank=True, null=True)),
                ('is_required', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('points', models.SmallIntegerField(default=0)),
                ('text', models.TextField(help_text='Use Markdown for formatting')),
                ('is_correct', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='choices', to='surveys.question')),
            ],
        ),
        migrations.CreateModel(
            name='Survey',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(blank=True, max_length=255, null=True, unique=True)),
                ('description', models.TextField(blank=True, help_text='Use Markdown for formatting', null=True)),
                ('is_test', models.BooleanField(default=False)),
                ('is_public', models.BooleanField(default=False)),
                ('author_visible', models.BooleanField(default=False)),
                ('theme_mode', models.CharField(choices=[('light', 'light'), ('dark', 'Dark')], default='light', max_length=10)),
                ('bg_image', models.ImageField(blank=True, null=True, upload_to='images/survey/background/')),
                ('finish_text', models.TextField(blank=True, null=True)),
                ('time_limit_minutes', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('random_question_order', models.BooleanField(default=False)),
                ('allow_answer_changes', models.BooleanField(default=True)),
                ('show_total_points_at_end', models.BooleanField(default=True)),
                ('show_correct_answers_at_end', models.BooleanField(default=False)),
                ('show_correct_answers_after_question', models.BooleanField(default=False)),
                ('attempts_allowed', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('author_will_see_attempts', models.BooleanField(default=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='surveys', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='question',
            name='survey',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='surveys.survey'),
        ),
        migrations.CreateModel(
            name='SurveyAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('survey', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='surveys.survey')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='survey_attempts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='SurveyAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempts_allowed', models.PositiveSmallIntegerField(default=1)),
                ('attempts_made', models.PositiveSmallIntegerField(default=0)),
                ('survey', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to='surveys.survey')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='survey_accesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('survey', 'user')},
            },
        ),
        migrations.CreateModel(
            name='QuestionAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('text_answer', models.TextField(blank=True, null=True)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='surveys.question')),
                ('selected_choices', models.ManyToManyField(blank=True, related_name='question_attempts', to='surveys.choice')),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='question_attempts', to='surveys.surveyattempt')),
            ],
            options={
                'unique_together': {('attempt', 'question')},
            },
        ),
    ]