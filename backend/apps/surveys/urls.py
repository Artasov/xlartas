from django.urls import path

from .controllers.accesses import (
    get_survey_accesses,
    survey_access_create,
    survey_access_update,
    survey_access_delete,
)
from .controllers.attempts import (
    get_survey_attempts,
    survey_attempt_create_or_get_last,
    survey_attempt_update,
    question_attempt_create_or_update,
    question_attempt_update,
)
from .controllers.choices import (
    choice_create,
    choice_update,
    choice_delete
)
from .controllers.questions import (
    question_create,
    question_update,
    question_delete
)
from .controllers.surveys import (
    survey_create, survey_update, survey_delete,
    get_current_user_surveys, get_survey_by_slug
)

urlpatterns = [
    path('current_user/', get_current_user_surveys, name='get_current_user_surveys'),
    path('<slug:slug>/', get_survey_by_slug, name='get_survey_by_slug'),

    path('survey/create/', survey_create, name='survey_create'),
    path('survey/update/', survey_update, name='survey_update'),
    path('survey/delete/', survey_delete, name='survey_delete'),

    path('questions/create/', question_create, name='question_create'),
    path('questions/update/', question_update, name='question_update'),
    path('questions/delete/', question_delete, name='question_delete'),

    path('choices/create/', choice_create, name='choice_create'),
    path('choices/update/', choice_update, name='choice_update'),
    path('choices/delete/', choice_delete, name='choice_delete'),

    path('survey/accesses/', get_survey_accesses, name='get_survey_accesses'),
    path('survey/access/create/', survey_access_create, name='survey_access_create'),
    path('survey/access/update/', survey_access_update, name='survey_access_update'),
    path('survey/access/delete/', survey_access_delete, name='survey_access_delete'),

    path('survey/attempts/', get_survey_attempts, name='get_survey_attempts'),
    path('survey/attempt/create_or_get_last/', survey_attempt_create_or_get_last,
         name='survey_attempt_create_or_get_last'),
    path('survey/attempt/update/', survey_attempt_update, name='survey_attempt_update'),

    path('question/attempt/create_or_update/', question_attempt_create_or_update,
         name='question_attempt_create_or_update'),
    path('question/attempt/update/', question_attempt_update, name='question_attempt_update'),
]
