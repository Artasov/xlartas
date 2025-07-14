from typing import Any

from adjango.tasks import send_emails_task
from adjango.utils.common import traceback_str
from django.conf import settings
from django.core.handlers.asgi import ASGIRequest
from django.core.handlers.wsgi import WSGIRequest


def handling_function(fn_name: str, request: WSGIRequest | ASGIRequest, e: Exception, *args: Any,
                      **kwargs: Any) -> None:
    """
    Пример функции обработки исключений.

    @param fn_name: Имя функции, в которой произошло исключение.
    @param request: Объект запроса (WSGIRequest или ASGIRequest).
    @param e: Исключение, которое нужно обработать.
    @param args: Позиционные аргументы, переданные в функцию.
    @param kwargs: Именованные аргументы, переданные в функцию.

    @return: None

    @usage:
        _handling_function(fn_name, request, e)
    """
    from utils.log import get_global_logger
    log = get_global_logger()
    error_text = (f'ERROR in {fn_name}:\n'
                  f'{traceback_str(e)}\n'
                  f'{request.POST=}\n'
                  f'{request.GET=}\n'
                  f'{request.FILES=}\n'
                  f'{request.COOKIES=}\n'
                  f'{request.user=}\n'
                  f'{args=}\n'
                  f'{kwargs=}')
    log.error(error_text)
    if not settings.DEBUG:
        send_emails_task.delay(
            subject='SERVER ERROR',
            emails=(settings.DEVELOPER_EMAIL,),
            template='admin/exception_report.html',
            context={'error': error_text}
        )
