# core/middleware/exception.py
import logging
import traceback

from django.utils.deprecation import MiddlewareMixin


class ExceptionLoggingMiddleware(MiddlewareMixin):
    @staticmethod
    def process_exception(request, _exception):
        log = logging.getLogger('global')  # Используйте ваш логгер
        # Получаем полную трассировку ошибки
        tb = traceback.format_exc()
        # Логируем информацию об ошибке
        log.error(f'Unhandled exception for path {request.path}\n{tb}')
        # Можно также отправить уведомление или выполнить другие действия.
        # Возвращаем None, чтобы использовать стандартную обработку ошибок Django
        return None

