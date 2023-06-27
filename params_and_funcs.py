from datetime import datetime

from django.utils import timezone
from django.conf import settings


def log(STRING: str):
    path = str(settings.BASE_DIR).replace("\\", '/') + '/log.txt'
    with open(path, 'a', encoding='utf-8') as file:
        date = str(timezone.now()) + " "
        file.write(date + STRING + '\n')
