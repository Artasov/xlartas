# surveys/controllers/questions.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.surveys.exceptions.base import CurrentUserNotSurveyAuthor
from apps.surveys.models import Question
from apps.surveys.serializers import QuestionEditSerializer


@acontroller('Create a new question')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def question_create(request) -> Response:
    serializer = QuestionEditSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    question = await serializer.asave()
    return Response(QuestionEditSerializer(question).data, status=status.HTTP_201_CREATED)


@acontroller('Update a question')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def question_update(request) -> Response:
    question_id = request.data.get('question_id')
    question = await aget_object_or_404(Question, id=question_id)
    survey = await question.arelated('survey')
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = QuestionEditSerializer(question, data=request.data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    question = await serializer.asave()
    return Response(QuestionEditSerializer(question).data, status=status.HTTP_200_OK)


@acontroller('Delete a question')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def question_delete(request) -> Response:
    question_id = request.data.get('question_id')
    question = await aget_object_or_404(Question, id=question_id)
    survey = await question.arelated('survey')
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await question.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)
