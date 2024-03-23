from rest_framework import status
from rest_framework.response import Response
from transliterate.utils import _

SUCCESS_CONFIRMATION_CODE_SENT = _('Confirmation code has been successfully sent to your email.')


class Responses:
    class Success:
        ConformationCodeSent = Response({'message': SUCCESS_CONFIRMATION_CODE_SENT}, status=status.HTTP_200_OK)