# confirmation/messages/success.py
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.response import Response

SUCCESS_CONFIRMATION_CODE_SENT = _('Confirmation code has been successfully sent.')


class Responses:
    class Success:
        ConformationCodeSent = Response({'message': SUCCESS_CONFIRMATION_CODE_SENT}, status=status.HTTP_200_OK)
