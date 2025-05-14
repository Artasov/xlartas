# surveys/controllers/attempts.py

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.shortcuts import aget_object_or_404
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK
)

from apps.core.exceptions.base import CoreException
from apps.core.exceptions.user import UserException
from apps.core.models.user import User
from apps.surveys.exceptions.base import (
    CurrentUserNotSurveyAuthor, SurveyIdWasNotProvided,
    ChangeCompletedSurveyAttemptForbidden, HaveNoMoreAttemptsLeftToPass
)
from apps.surveys.models import SurveyAttempt, QuestionAttempt, Survey, Question, Choice
from apps.surveys.serializers import QuestionAttemptSerializer, SurveyAttemptSerializer, ChoiceEditSerializer, \
    QuestionEditSerializer


@acontroller('Get Survey Attempts')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_survey_attempts(request) -> Response:
    user_id = request.GET.get('user_id')
    survey_id = request.GET.get('survey_id')

    if not user_id: raise UserException.UserIdWasNotProvided()
    if not survey_id: raise SurveyIdWasNotProvided()

    user = await aget_object_or_404(User, id=user_id)
    survey = await aget_object_or_404(Survey, id=survey_id)
    author = await survey.arelated('author')
    if author != request.user and user != request.user:
        raise CurrentUserNotSurveyAuthor()

    if author == request.user and not survey.author_will_see_attempts:
        raise CoreException.AccessDenied()

    attempts = await SurveyAttempt.objects.afilter(user=user, survey=survey)
    attempts_data = []
    for attempt in attempts:
        question_attempts = await QuestionAttempt.objects.afilter(attempt=attempt)
        attempt_data = SurveyAttemptSerializer(attempt).data
        attempt_data['questions_attempts'] = QuestionAttemptSerializer(
            question_attempts, many=True).data
        attempts_data.append(attempt_data)
    return Response(attempts_data, status=HTTP_200_OK)


@acontroller('Create Survey Attempt')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def survey_attempt_create_or_get_last(request) -> Response:
    serializer = SurveyAttemptSerializer(data=request.data, context={'request': request})
    await serializer.ais_valid(raise_exception=True)
    not_finished_attempt = await SurveyAttempt.objects.agetorn(
        survey_id=serializer.validated_data['survey'],
        user_id=serializer.validated_data['user'],
        end_time=None
    )
    if not_finished_attempt:
        data = SurveyAttemptSerializer(not_finished_attempt).data
        q_attempts = await QuestionAttempt.objects.afilter(attempt_id=data['id'])
        q_data = await QuestionAttemptSerializer(q_attempts, many=True).adata
        data['questions_attempts'] = q_data
        return Response(data, HTTP_200_OK)

    survey: Survey = serializer.validated_data['survey']
    if survey and await SurveyAttempt.objects.filter(
            survey_id=serializer.validated_data['survey'],
            user_id=serializer.validated_data['user']
    ).acount() >= survey.attempts_allowed: raise HaveNoMoreAttemptsLeftToPass()

    await serializer.asave()
    return Response(await serializer.adata, HTTP_201_CREATED)


@acontroller('Update Survey Attempt')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def survey_attempt_update(request) -> Response:
    attempt_id = request.data.get('attempt_id')
    end_time = request.data.get('end_time')
    attempt = await aget_object_or_404(SurveyAttempt, id=attempt_id)
    attempt_user = await attempt.arelated('user')
    if attempt_user != request.user: raise CoreException.AccessDenied()

    data = request.data.copy()
    if attempt.start_time: data.pop('start_time', None)
    if attempt.end_time: raise ChangeCompletedSurveyAttemptForbidden()

    serializer = SurveyAttemptSerializer(attempt, data=data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    await serializer.asave()
    data = serializer.data
    data['questions'] = []
    if end_time:
        async for question in Question.objects.filter(survey_id=attempt.survey_id):
            question_data = QuestionEditSerializer(question).data
            question_data['choices'] = []
            async for choice in Choice.objects.filter(question=question):
                question_data['choices'].append(ChoiceEditSerializer(choice).data)
            data['questions'].append(question_data)
    return Response(data, status=HTTP_200_OK)


@acontroller('Create Question Attempt')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def question_attempt_create_or_update(request) -> Response:
    data = request.data
    attempt_id = data.get('attempt')
    question_id = data.get('question')

    existing_attempt = await QuestionAttempt.objects.agetorn(
        attempt_id=attempt_id,
        question_id=question_id
    )

    if existing_attempt:
        serializer = QuestionAttemptSerializer(
            existing_attempt, data=data,  # partial=True
        )
    else:
        serializer = QuestionAttemptSerializer(data=data)

    await serializer.ais_valid(raise_exception=True)
    await serializer.asave()
    return Response(
        await serializer.adata,
        status=HTTP_200_OK if existing_attempt else HTTP_201_CREATED
    )


@acontroller('Update Question Attempt')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def question_attempt_update(request) -> Response:
    attempt_id = request.data.get('attempt_id')
    attempt = await aget_object_or_404(QuestionAttempt, id=attempt_id)
    if attempt.end_time: raise ChangeCompletedSurveyAttemptForbidden()
    data = request.data.copy()
    if attempt.start_time: data.pop('start_time', None)
    serializer = QuestionAttemptSerializer(attempt, data=data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    await serializer.asave()
    return Response(await serializer.adata, status=HTTP_200_OK)
