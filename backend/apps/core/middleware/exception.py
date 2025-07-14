# core/middleware/exception.py
from utils.log import get_global_logger
import traceback

from django.utils.deprecation import MiddlewareMixin


class ExceptionLoggingMiddleware(MiddlewareMixin):
    @staticmethod
    def process_exception(request, _exception):
        log = get_global_logger()  # Используйте ваш логгер
        # Получаем полную трассировку ошибки
        tb = traceback.format_exc()
        # Логируем информацию об ошибке
        log.error(f'Unhandled exception for path {request.path}\n{tb}')
        # Можно также отправить уведомление или выполнить другие действия.
        # Возвращаем None, чтобы использовать стандартную обработку ошибок Django
        return None
