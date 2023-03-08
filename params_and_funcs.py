import json
import re
import urllib
from datetime import datetime

from django.conf import settings
from django.template.loader import render_to_string

from xLLIB_v1 import send_EMail


def EMAIL_validator(email: str, min_len: int = 1, max_len: int = 200) -> bool:
    res = re.match(r'[A-Z0-9a-z.]+@+[A-Z0-9a-z]+[.]+[A-Z0-9a-z]+', email)
    if (res is not None and
            len(res.group(0)) == len(email) and
            min_len <= len(res.group(0)) <= max_len):
        return True
    else:
        return False


def send_email_by_template(subject: str, to_email: str, template: str, context: dict = {}, ):
    html_content = str(render_to_string(template, context=context))
    send_EMail(25, to_email, subject, html_content)


def TEL_validator(tel: str, min_len: int = 11, max_len: int = 12) -> bool:
    res = re.match(r'[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}', tel)
    if (res is not None and
            len(res.group(0)) == len(tel) and
            min_len <= len(res.group(0)) <= max_len):
        return True
    else:
        return False


def reCAPTCHA_validation(request):
    recaptcha_response = request.POST.get('g-recaptcha-response')
    url = 'https://www.google.com/recaptcha/api/siteverify'
    values = {
        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
        'response': recaptcha_response
    }
    data = urllib.parse.urlencode(values).encode()
    req = urllib.request.Request(url, data=data)
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode())
    return result


def log(STRING: str):
    path = str(settings.BASE_DIR).replace("\\", '/') + '/log.txt'
    with open(path, 'a', encoding='utf-8') as file:
        date = str(datetime.now()) + " "
        file.write(date + STRING + '\n')
