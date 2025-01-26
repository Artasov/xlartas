from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from asgiref.sync import sync_to_async
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.async_django import arelated
from apps.core.exceptions.base import CoreExceptions
from adjango.adecorators import acontroller
from apps.surveys.exceptions.base import CurrentUserNotSurveyAuthor
from apps.surveys.models import Question
from apps.surveys.serializers import QuestionEditSerializer


@acontroller('Create a new question')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def question_create(request) -> Response:
    serializer = QuestionEditSerializer(data=request.data)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    question = await serializer.asave()
    return Response(QuestionEditSerializer(question).data, status=status.HTTP_201_CREATED)


@acontroller('Update a question')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def question_update(request) -> Response:
    question_id = request.data.get('question_id')
    question = await aget_object_or_404(Question, id=question_id)
    survey = await arelated(question, 'survey')
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = QuestionEditSerializer(question, data=request.data, partial=True)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    question = await serializer.asave()
    return Response(QuestionEditSerializer(question).data, status=status.HTTP_200_OK)


@acontroller('Delete a question')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def question_delete(request) -> Response:
    question_id = request.data.get('question_id')
    question = await aget_object_or_404(Question, id=question_id)
    survey = await arelated(question, 'survey')
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await question.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)
