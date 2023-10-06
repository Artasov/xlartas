import base64

from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.shortcuts import render
from django.utils.decorators import decorator_from_middleware
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from APP_private_msg.models import PrivateMsg
from Core.error_messages import NOT_ANY_FIELDS_FILLED, REF_CODE_NOT_SPECIFIED, NOT_FOUND_404, RECAPTCHA_INVALID
from Core.services.services import render_invalid, check_recaptcha_is_valid
from xLLIB_v1 import random_str


@transaction.atomic
@api_view(['GET', 'POST'])
def create(request):
    if request.method != 'POST':
        return render(request, 'APP_private_msg/create.html')

    if not check_recaptcha_is_valid(request.POST.get('g-recaptcha-response')):
        return Response({'data': RECAPTCHA_INVALID}, status=status.HTTP_403_FORBIDDEN)

    text = str(request.POST.get('text')).strip('\n\t').strip()
    file: InMemoryUploadedFile = request.FILES.get('file')
    audio_file = request.FILES.get('audio-file')
    if not text and not audio_file and not file:
        return Response({'data': NOT_ANY_FIELDS_FILLED}, status=status.HTTP_403_FORBIDDEN)
    private_msg_ = PrivateMsg.objects.create(msg=text, file=file, voice_msg=audio_file)
    return Response({'data': {'key': private_msg_.key}}, status=status.HTTP_200_OK)


def preread(request, key=None,):
    if key is None:
        return render_invalid(request, NOT_FOUND_404, 'private-msg:create')

    try:
        msg_ = PrivateMsg.objects.get(key=key)
    except PrivateMsg.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'private-msg:create')

    return render(request, 'APP_private_msg/read.html', {'key': key})


def read(request, key=None):
    if key is None:
        return render_invalid(request, NOT_FOUND_404, 'private-msg:create')
    try:
        msg_ = PrivateMsg.objects.get(key=key)
    except PrivateMsg.DoesNotExist:
        return render_invalid(request, NOT_FOUND_404, 'private-msg:create')

    msg_.delete()

    return render(request, 'APP_private_msg/read.html', {
        'read': True,
        'msg': msg_
    })
