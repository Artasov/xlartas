# -*- coding: utf-8 -*-
from collections import Counter

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
        rand_str = ''.join(random.choice(alphabet) for _ in range(length))
    else:
        try:
            rand_str = ''.join(random.sample(alphabet, length))
        except ValueError:
            return "The alphabet is less than the length of the string. Generation without repetition is impossible."
    if upper:
        return rand_str.upper()
    else:
        return rand_str


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
