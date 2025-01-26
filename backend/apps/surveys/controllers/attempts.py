from pprint import pprint

from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.shortcuts import aget_object_or_404
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST
)

from apps.core.async_django import arelated, aget_or_none, afilter
from apps.core.exceptions.base import CoreExceptions
from apps.core.exceptions.user import UserExceptions
from apps.core.models.user import User
from adjango.adecorators import acontroller
from apps.surveys.exceptions.base import (
    CurrentUserNotSurveyAuthor, SurveyIdWasNotProvided,
    ChangeCompletedSurveyAttemptForbidden, HaveNoMoreAttemptsLeftToPass
)
from apps.surveys.models import SurveyAttempt, QuestionAttempt, Survey, Question, Choice
from apps.surveys.serializers import QuestionAttemptSerializer, SurveyAttemptSerializer, QuestionSerializer, \
    ChoiceEditSerializer, QuestionEditSerializer


@acontroller('Get Survey Attempts')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_survey_attempts(request) -> Response:
    user_id = request.GET.get('user_id')
    survey_id = request.GET.get('survey_id')

    if not user_id: raise UserExceptions.UserIdWasNotProvided()
    if not survey_id: raise SurveyIdWasNotProvided()

    user = await aget_object_or_404(User, id=user_id)
    survey = await aget_object_or_404(Survey, id=survey_id)
    author = await arelated(survey, 'author')
    if author != request.user and user != request.user:
        raise CurrentUserNotSurveyAuthor()

    if author == request.user and not survey.author_will_see_attempts:
        raise CoreExceptions.AccessDenied()

    attempts = await afilter(SurveyAttempt.objects, user=user, survey=survey)
    attempts_data = []
    for attempt in attempts:
        question_attempts = await afilter(QuestionAttempt.objects, attempt=attempt)
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
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=HTTP_400_BAD_REQUEST
        )
    not_finished_attempt = await aget_or_none(
        SurveyAttempt.objects,
        survey_id=serializer.validated_data['survey'],
        user_id=serializer.validated_data['user'],
        end_time=None
    )
    if not_finished_attempt:
        data = SurveyAttemptSerializer(not_finished_attempt).data
        q_attempts = await afilter(QuestionAttempt.objects, attempt_id=data['id'])
        q_data = await sync_to_async(
            lambda: QuestionAttemptSerializer(q_attempts, many=True).data
        )()
        data['questions_attempts'] = q_data
        return Response(data, HTTP_200_OK)

    survey: Survey = serializer.validated_data['survey']
    if survey and await SurveyAttempt.objects.filter(
            survey_id=serializer.validated_data['survey'],
            user_id=serializer.validated_data['user']
    ).acount() >= survey.attempts_allowed: raise HaveNoMoreAttemptsLeftToPass()

    await serializer.asave()
    return Response(serializer.data, HTTP_201_CREATED)


@acontroller('Update Survey Attempt')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def survey_attempt_update(request) -> Response:
    attempt_id = request.data.get('attempt_id')
    end_time = request.data.get('end_time')
    attempt = await aget_object_or_404(SurveyAttempt, id=attempt_id)
    attempt_user = await arelated(attempt, 'user')
    if attempt_user != request.user: raise CoreExceptions.AccessDenied()

    data = request.data.copy()
    if attempt.start_time: data.pop('start_time', None)
    if attempt.end_time: raise ChangeCompletedSurveyAttemptForbidden()

    serializer = SurveyAttemptSerializer(attempt, data=data, partial=True)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=HTTP_400_BAD_REQUEST
        )
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
    pprint(data)
    return Response(data, status=HTTP_200_OK)


@acontroller('Create Question Attempt')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def question_attempt_create_or_update(request) -> Response:
    data = request.data
    attempt_id = data.get('attempt')
    question_id = data.get('question')

    existing_attempt = await aget_or_none(
        QuestionAttempt.objects,
        attempt_id=attempt_id,
        question_id=question_id
    )

    if existing_attempt:
        serializer = QuestionAttemptSerializer(
            existing_attempt, data=data,  # partial=True
        )
    else:
        serializer = QuestionAttemptSerializer(data=data)
    print(request.data)

    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=HTTP_400_BAD_REQUEST
        )

    await sync_to_async(serializer.save)()
    return Response(await sync_to_async(lambda: serializer.data)(),
                    status=HTTP_200_OK if existing_attempt else HTTP_201_CREATED)


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
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=HTTP_400_BAD_REQUEST
        )
    await serializer.asave()
    return Response(serializer.data, status=HTTP_200_OK)
