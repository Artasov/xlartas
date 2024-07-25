# exceptions/base.py
from rest_framework import status
from rest_framework.exceptions import APIException


class CurrentUserNotSurveyAuthor(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': 'You are not the author of the survey.'}
    default_code = 'current_user_not_survey_author'


class SurveyIdWasNotProvided(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': 'Survey id was not provided.'}
    default_code = 'survey_id_was_not_provided'


class ChangeCompletedSurveyAttemptForbidden(APIException):
    status_code = status.HTTP_423_LOCKED
    default_detail = {'message': 'Нельзя изменять уже законченную попытку.'}
    default_code = 'change_completed_survey_attempt_forbidden'


class HaveNoMoreAttemptsLeftToPass(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': 'У вас не осталось попыток для прохождения.'}
    default_code = 'have_no_more_attempts_left_to_pass'
