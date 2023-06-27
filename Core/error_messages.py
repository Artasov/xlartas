from rest_framework.reverse import reverse

NOT_FOUND_404 = 'По этому адресу ничего не найдено.'

#

RECAPTCHA_INVALID = 'Не пройдена проверка reCaptcha.'
FORBIDDEN = 'Доступ запрещён.'
USER_UNCONFIRMED = 'Ваш аккаунт не подтверждён. ' \
                      'Введите пароль пройдите проверку ' \
                      'reCaptcha  мы отправим вам письмо для ' \
                      'подтверждения регистрации вашего аккаунта.'
CONFIRMATION_CODE_EXPIRE = 'Время действия предыдущего кода подтверждения закончился.'
PASSWORD_RESET_SUCCESS = 'Вы успешно сменили пароль.'
EMAIL_SENT = 'Мы отправили вам письмо для подтверждения на почту {}.'
CONFIRMATION_CODE_SENT_TOO_OFTEN = 'Подождите перед отправкой нового кода подтверждения. Для отправки введите логин и пароль.'
USER_USERNAME_ALREADY_EXISTS = 'Пользователь с таким именем уже существует.'
USER_EMAIL_ALREADY_EXISTS = 'Пользователь с такой почтой уже существует.'
USER_USERNAME_NOT_EXISTS = 'Пользователя с таким именем не существует.'
USER_EMAIL_NOT_EXISTS = 'Пользователя с такой почтой не существует.'
CONFIRMATION_CODE_WRONG = 'Неверный код подтверждения.'
PASSWORD_WRONG = 'Неверный пароль.'
PASSWORDS_NOT_EQUAL = 'Пароли не совпадают.'
SUCCESSFULLY_REGISTERED = 'Вы успешно зарегистрировались. Теперь Вы можете войти в аккаунт.'
SOMETHING_WRONG = 'Что-то пошло не так, повторите попытку или свяжитесь с нами.'
NOT_ALL_FIELDS_FILLED = 'Вы заполнили не все поля.'
NOT_ANY_FIELDS_FILLED = 'Вы не заполнили ни одного поля.'
CYRILLIC_SYMBOLS_FORBIDDEN = 'Кириллические символы недоступны.'
NOT_ALL_FIELDS_FILLED_OR_INCORRECT = 'Вы заполнили не все поля или заполнили некорректно.'
OBJ_WITH_THIS_NAME_EXISTS = 'Такое имя уже занято.'
FILE_TOO_BIG = 'Файл слишком большой.'
IMAGE_TOO_BIG = 'Изображение слишком большое.'
# REFERRAL SYSTEM
REF_CODE_DOES_NOT_EXIST = 'Такого реферального кода не существует.'
REF_CODE_SELF_USAGE = 'Вы используете свой реферальный код.'
REF_CODE_NOT_SPECIFIED = 'Реферальный код не указан.'
INVITER_ALREADY_SETTED = 'Вы уже указали того, кто вас пригласил.'
# program auth api
LOGIN_OR_SECRET_KEY_WRONG = 'Неверный логин или секретный ключ.'
MULTI_ACCOUNT_PROHIBITED = 'Обнаружено использование мульти-аккаунта. В доступе отказано.'
HWID_NOT_TRANSFERRED = 'Hwid не был передан. Свяжитесь с нами по контактным данным на сайте.'
PRODUCT_NAME_NOT_TRANSFERRED = 'Наименование продукта не было передано. Свяжитесь с нами по контактным данным на сайте.'
# Product
PRODUCT_NOT_EXISTS = 'Продукт с таким именем не найден.'
LICENSE_TIMEOUT = 'Лицензия закончилась. Для продления перейдите по ссылке {}'
HWID_NOT_EQUAL = 'Ваш персональный id на машине invalid. Возможно вы сменили машину.'