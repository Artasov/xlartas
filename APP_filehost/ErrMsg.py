from django.conf import settings

UPLOAD_TOO_BIG = f'Общий размер загрузки не должен превышать ' \
                 f'{settings.MAX_UPLOAD_SIZE_ANON_MB} MB, для анонимных пользователей и ' \
                 f'{settings.MAX_UPLOAD_SIZE_AUTHED_MB} MB для авторизированных.'