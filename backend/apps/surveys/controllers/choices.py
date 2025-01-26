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
from apps.surveys.models import Choice
from apps.surveys.serializers import ChoiceSerializer, ChoiceEditSerializer


@acontroller('Create a new choice')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def choice_create(request) -> Response:
    serializer = ChoiceEditSerializer(data=request.data)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    choice = await serializer.asave()
    return Response(ChoiceEditSerializer(choice).data, status=status.HTTP_201_CREATED)


@acontroller('Update a choice')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def choice_update(request) -> Response:
    choice_id = request.data.get('choice_id')
    choice = await aget_object_or_404(Choice, id=choice_id)
    question = await arelated(choice, 'question')
    survey = await arelated(question, 'survey')
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = ChoiceEditSerializer(choice, data=request.data, partial=True)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    choice = await serializer.asave()
    return Response(ChoiceEditSerializer(choice).data, status=status.HTTP_200_OK)


@acontroller('Delete a choice')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def choice_delete(request) -> Response:
    choice_id = request.data.get('choice_id')
    choice = await aget_object_or_404(Choice, id=choice_id)
    question = await arelated(choice, 'question')
    survey = await arelated(question, 'survey')
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await choice.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)
