# surveys/controllers/accesses.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from django.conf import settings
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.captcha.yandex import captcha_required
from apps.core.exceptions.base import CoreException
from apps.core.exceptions.user import UserException
from apps.core.models.user import User
from apps.core.tasks.mail_tasks import send_survey_access, send_auto_created_user
from apps.surveys.exceptions.base import CurrentUserNotSurveyAuthor, SurveyIdWasNotProvided
from apps.surveys.models import SurveyAccess, Survey
from apps.surveys.serializers import SurveyAccessSerializer


@acontroller('Get Survey Accesses')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_survey_accesses(request) -> Response:
    survey_id = request.GET.get('survey_id')
    if not survey_id: raise SurveyIdWasNotProvided()
    survey = await aget_object_or_404(Survey, id=survey_id)
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    accesses = await SurveyAccess.objects.afilter(survey=survey)
    accesses_data = []
    for access in accesses:
        user = await access.arelated('user')
        access_data = SurveyAccessSerializer(access).data
        access_data['user'] = {'id': user.id, 'email': user.email}
        accesses_data.append(access_data)
    return Response(accesses_data, status=status.HTTP_200_OK)


@acontroller('Create Survey Access')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
@captcha_required
async def survey_access_create(request) -> Response:
    if not request.is_captcha_valid: raise CoreException.CaptchaInvalid()
    survey_id = request.data.get('survey')
    email = request.data.get('email')

    if not email: raise UserException.EmailWasNotProvided()

    survey = await aget_object_or_404(Survey, id=survey_id)
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()

    user = await User.objects.aby_creds(email)
    if not user:
        username = email.split('@')[0]
        password = get_random_string(length=12)
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        if not settings.DEBUG:
            send_auto_created_user.delay(
                # action_mail=ActionsMails.get(ActionTypes.AUTO_CREATED_USER), # TODO не верно
                to_email=email,
                username=username,
                password=password
            )

    request.data['user'] = user.id
    serializer = SurveyAccessSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    access = await serializer.asave()

    if not settings.DEBUG:
        send_survey_access.delay(
            # action_mail=ActionsMails.get(ActionTypes.SURVEY_ACCESS), # TODO не верно
            to_email=email,
            link=f'{settings.DOMAIN_URL}/surveys/{survey.slug}/'
        )

    return Response(SurveyAccessSerializer(access).data, status=status.HTTP_201_CREATED)


@acontroller('Update Survey Access')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def survey_access_update(request) -> Response:
    access_id = request.data.get('access_id')
    access = await aget_object_or_404(SurveyAccess, id=access_id)
    survey = await access.arelated('survey')
    author = await survey.arelated('author')
    if author != request.user:
        raise CurrentUserNotSurveyAuthor()
    data = request.data.copy()
    data.pop('attempts_made', None)  # Remove attempts_made from data to prevent modification
    serializer = SurveyAccessSerializer(access, data=data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    access = await serializer.asave()
    return Response(SurveyAccessSerializer(access).data, status=status.HTTP_200_OK)


@acontroller('Delete Survey Access')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def survey_access_delete(request) -> Response:
    access_id = request.data.get('access_id')
    access = await aget_object_or_404(SurveyAccess, id=access_id)
    survey = await access.arelated('survey')
    author = await survey.arelated('author')
    if author != request.user:
        raise CurrentUserNotSurveyAuthor()
    await access.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)
