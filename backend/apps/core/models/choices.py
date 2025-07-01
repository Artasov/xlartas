# core/models/choices.py
from django.db.models import IntegerChoices
from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _


class WeekDays(TextChoices):
    MONDAY = 'monday', _('Monday')
    TUESDAY = 'tuesday', _('Tuesday')
    WEDNESDAY = 'wednesday', _('Wednesday')
    THURSDAY = 'thursday', _('Thursday')
    FRIDAY = 'friday', _('Friday')
    SATURDAY = 'saturday', _('Saturday')
    SUNDAY = 'sunday', _('Sunday')


class Language(TextChoices):
    RUS = 'RUS', _('Russian')
    ENG = 'ENG', _('English')


class Timezone(IntegerChoices):
    UTC__12 = -12, _('UTC-12')
    UTC__11 = -11, _('UTC-11')
    UTC__10 = -10, _('UTC-10')
    UTC__9 = -9, _('UTC-9')
    UTC__8 = -8, _('UTC-8')
    UTC__7 = -7, _('UTC-7')
    UTC__6 = -6, _('UTC-6')
    UTC__5 = -5, _('UTC-5')
    UTC__4 = -4, _('UTC-4')
    UTC__3 = -3, _('UTC-3')
    UTC__2 = -2, _('UTC-2')
    UTC__1 = -1, _('UTC-1')
    UTC = 0, _('UTC')
    UTC_1 = 1, _('UTC+1')
    UTC_2 = 2, _('UTC+2')
    UTC_3 = 3, _('UTC+3')
    UTC_4 = 4, _('UTC+4')
    UTC_5 = 5, _('UTC+5')
    UTC_6 = 6, _('UTC+6')
    UTC_7 = 7, _('UTC+7')
    UTC_8 = 8, _('UTC+8')
    UTC_9 = 9, _('UTC+9')
    UTC_10 = 10, _('UTC+10')
    UTC_11 = 11, _('UTC+11')
    UTC_12 = 12, _('UTC+12')
    UTC_13 = 13, _('UTC+13')
    UTC_14 = 14, _('UTC+14')


class Gender(TextChoices):
    MALE = 'male', _('Male')
    FEMALE = 'female', _('Female')
