# -*- coding: utf-8 -*-
from collections import Counter

import environ

ALPHABETS = {
    'en': 'abcdefghijklmnopqrstuvwxyz',
    'ru': 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
}


def ReadFile(path, printing=False, encoding='utf-8'):
    if printing:
        print(open(path, 'r', encoding=encoding).read())
    return open(path, 'r', encoding=encoding).read()


def OpenWrite(path, text, printing=False, encoding='utf-8'):
    open(path, 'w', encoding=encoding).write(text)
    if printing:
        print(open(path, 'r', encoding=encoding).read())


def OpenAppend(path, text, printing=False, encoding='utf-8'):
    open(path, 'a', encoding=encoding).write(text)
    if printing:
        print(open(path, 'r', encoding=encoding).read())


def OpenPrepend(path, text, printing=False, encoding='utf-8'):
    text_ = text + open(path, 'r', encoding=encoding).read()
    open(path, 'w', encoding=encoding).write(text_)
    if printing:
        print(open(path, 'r', encoding=encoding).read())


def OpenAndReplace(path, what, to, printing=False, encoding='utf-8'):
    text = open(path, 'r', encoding=encoding).read().replace(what, to)
    open(path, 'w', encoding=encoding).write(text)
    if printing:
        print(open(path, 'r', encoding=encoding).read())


def random_str(length: int = 10, alphabet: str = ALPHABETS['en'], repete: bool = True, upper: bool = True,
               digits: bool = True):  # ru #digits
    import random

    if alphabet == 'ru':
        alphabet = ALPHABETS['ru']
    if alphabet == 'en' or alphabet == 'eu':
        alphabet = ALPHABETS['en']

    if digits:
        alphabet += '0123456789'

    if repete:
        rand_str = ''.join(random.choice(alphabet) for i in range(length))
    else:
        try:
            rand_str = ''.join(random.sample(alphabet, length))
        except ValueError:
            return "The alphabet is less than the length of the string. Generation without repetition is impossible."
    if upper:
        return rand_str.upper()
    else:
        return rand_str


def send_EMail(port: int, to: str, subject: str, html: str):
    env = environ.Env()
    server = 'smtp.timeweb.ru'
    user = env('EMAIL_HOST_USER')
    password = env('EMAIL_HOST_PASSWORD')

    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from platform import python_version

    sender = user
    subject = subject
    text = 'Something go wrong'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to
    msg['Reply-To'] = sender
    msg['Return-Path'] = sender
    msg['X-Mailer'] = 'Python/' + (python_version())

    part_text = MIMEText(text, 'plain')
    part_html = MIMEText(html, 'html')

    msg.attach(part_text)
    msg.attach(part_html)

    mail = smtplib.SMTP_SSL(server)
    mail.login(user, password)
    mail.sendmail(sender, to, msg.as_string())
    mail.quit()


def del_dict_values_by_value(d: dict, value=None, count_to_delete='ALL') -> dict:
    if value is None:
        value = ['']

    done_dict = {}
    count_deleted = 0
    for i in range(len(d)):
        if count_to_delete == 'ALL':
            if d[list(d.keys())[i]] != value:
                done_dict[list(d.keys())[i]] = d[list(d.keys())[i]]
            else:
                count_deleted += 1
        elif type(count_to_delete) == 'int':
            if count_deleted <= count_to_delete:
                if d[list(d.keys())[i]] != value:
                    done_dict[list(d.keys())[i]] = d[list(d.keys())[i]]
                else:
                    count_deleted += 1
    return done_dict


def anagram(first: str, second: str) -> bool:
    """Скрипт проверяет, являются ли две строки анаграммами друг друга. Иными словами, не получена ли одна строка перестановкой символов другой строки."""
    return Counter(first) == Counter(second)


def chunk(lst: list, size: int) -> list:
    """Нарезает список на списки меньшего размера, которые собраны снова в список. Размер надо задать заранее."""
    return [lst[i:i + size] for i in range(0, len(lst), size)]


def compact(lst: list) -> list:
    """Удаляет «ложные» значения (False, None, 0 и пустую строку ' ') из списка."""
    return list(filter(None, lst))


def deep_flatten(lst: list) -> list:
    """Сделать список плоским."""
    flat_list = []
    [flat_list.extend(deep_flatten(x)) for x in lst] if isinstance(lst, list) else flat_list.append(lst)
    return flat_list


def has_duplicates(lst: list) -> bool:
    """Содержатся ли в списке повторяющиеся значения (дубликаты)."""
    return len(lst) != len(set(lst))


def most_frequent(lst: list):
    """Самый частый элемент."""
    return max(set(lst), key=lst.count)


def to_roman_numeral(num: int) -> str:
    """Преобразует число в обычной десятичной («арабской») записи в форму римского числа. Работает со значениями от 1 до 3999 включительно, возвращает строку (str)."""
    lookup = [
        (1000, 'M'),
        (900, 'CM'),
        (500, 'D'),
        (400, 'CD'),
        (100, 'C'),
        (90, 'XC'),
        (50, 'L'),
        (40, 'XL'),
        (10, 'X'),
        (9, 'IX'),
        (5, 'V'),
        (4, 'IV'),
        (1, 'I'),
    ]
    res = ''
    for (n, roman) in lookup:
        (d, num) = divmod(num, n)
        res += roman * d
    return res

# import time
#
# start_time = time.time()
#
# a = 1
# b = 2
# c = a + b
# print(c) #3
#
# end_time = time.time()
# total_time = end_time - start_time
# print("Time: ", total_time)
