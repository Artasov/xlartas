# surveys/controllers/choices.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.surveys.exceptions.base import CurrentUserNotSurveyAuthor
from apps.surveys.models import Choice
from apps.surveys.serializers import ChoiceEditSerializer


@acontroller('Create a new choice')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def choice_create(request) -> Response:
    serializer = ChoiceEditSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    choice = await serializer.asave()
    return Response(
        await ChoiceEditSerializer(choice).adata,
        status=status.HTTP_201_CREATED
    )


@acontroller('Update a choice')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def choice_update(request) -> Response:
    choice_id = request.data.get('choice_id')
    choice = await aget_object_or_404(Choice, id=choice_id)
    question = await choice.arelated('question')
    survey = await question.arelated('survey')
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = ChoiceEditSerializer(choice, data=request.data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    choice = await serializer.asave()
    return Response(
        await ChoiceEditSerializer(choice).adata,
        status=status.HTTP_200_OK
    )


@acontroller('Delete a choice')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def choice_delete(request) -> Response:
    choice_id = request.data.get('choice_id')
    choice = await aget_object_or_404(Choice, id=choice_id)
    question = await choice.arelated('question')
    survey = await question.arelated('survey')
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await choice.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)
