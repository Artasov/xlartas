# software/exceptions/license.py
from adjango.exceptions.base import (
    ApiExceptionGenerator,
    ModelApiExceptionGenerator,
    ModelApiExceptionBaseVariant as MAEBV,
)
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_400_BAD_REQUEST


class SoftwareLicenseException:
    """Deprecated container. Use generators at call sites.

    Example:
        raise ModelApiExceptionGenerator(SoftwareLicense, MAEBV.AlreadyUsed,
                                         code='test_period_already_used',
                                         extra={'message': str(_('Test period already used'))})
    """
