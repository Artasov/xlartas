from datetime import datetime, timedelta

from dateutil.relativedelta import relativedelta


class DateRange:
    """
    @class DateRange

    Класс для работы с временными интервалами, который предоставляет различные методы проверки и управления временем.

    @method __init__ - Конструктор класса, принимает начало и конец интервала.
    @method __contains__ - Проверяет, входит ли один интервал в другой.
    @method overlaps - Проверяет пересечение двух интервалов.
    @method minutes - Возвращает длительность интервала в минутах.
    @method hours - Возвращает длительность интервала в часах.
    @method days - Возвращает длительность интервала в днях.
    @method months - Возвращает длительность интервала в месяцах.
    @method years - Возвращает длительность интервала в годах.
    @method can_fit - Проверяет, можно ли вместить заданную длительность в интервал.
    @method starts_before - Проверяет, начинается ли интервал раньше другого.
    @method ends_after - Проверяет, заканчивается ли интервал позже другого.
    @method is_same_day - Проверяет, находится ли интервал в пределах одного дня.
    @method is_same_month - Проверяет, находится ли интервал в пределах одного месяца.
    @method is_same_year - Проверяет, находится ли интервал в пределах одного года.
    @method crosses_new_year - Проверяет, пересекает ли интервал Новый год.
    @method is_weekend_only - Проверяет, состоит ли интервал только из выходных.
    @method append - Добавляет время к концу интервала.
    @method prepend - Добавляет время к началу интервала.
    @method is_entirely_weekdays - Проверяет, состоит ли интервал только из будних дней.
    @method total_weekend_days - Возвращает количество выходных дней в интервале.
    @method starts_on_weekend - Проверяет, начинается ли интервал с выходного.
    @method ends_on_weekend - Проверяет, заканчивается ли интервал выходным.
    """

    def __init__(self, start: datetime, end: datetime = None,
                 minutes: int = 0, hours: int = 0, days: int = 0,
                 months: int = 0, years: int = 0):
        """
        @param start: Начало интервала (datetime).
        @param end: Конец интервала (datetime). Если не указан, будет вычислен на основе start и других параметров.
        @param minutes: Количество минут для добавления к start.
        @param hours: Количество часов для добавления к start.
        @param days: Количество дней для добавления к start.
        @param months: Количество месяцев для добавления к start.
        @param years: Количество лет для добавления к start.
        @raise ValueError: Если начальная дата позже или равна конечной (если end указан).
        """
        self.start = start
        if end is not None:
            if start >= end:
                raise ValueError('Start date must be before end date.')
            self.end = end
        else:
            self.end = start + timedelta(minutes=minutes, hours=hours, days=days)
            self.end += relativedelta(months=months, years=years)

    def __contains__(self, other: 'DateRange') -> bool:
        """
        @param other: Интервал для проверки (DateRange).
        @return: True, если указанный интервал полностью содержится в текущем.
        """
        return self.start <= other.start and self.end >= other.end

    def overlaps(self, other: 'DateRange') -> bool:
        """
        @param other: Интервал для проверки пересечения (DateRange).
        @return: True, если интервалы пересекаются.
        """
        return self.start < other.end and self.end > other.start

    def minutes(self) -> int:
        """
        @return: Длительность интервала в минутах.
        """
        return int((self.end - self.start).total_seconds() / 60)

    def hours(self) -> int:
        """
        @return: Длительность интервала в часах.
        """
        return int((self.end - self.start).total_seconds() / 3600)

    def days(self) -> int:
        """
        @return: Длительность интервала в днях.
        """
        return (self.end - self.start).days

    def months(self) -> int:
        """
        @return: Длительность интервала в месяцах.
        """
        delta = relativedelta(self.end, self.start)
        return delta.years * 12 + delta.months

    def years(self) -> int:
        """
        @return: Длительность интервала в годах.
        """
        return relativedelta(self.end, self.start).years

    def can_fit(self, minutes: int = 0, hours: int = 0, days: int = 0, months: int = 0, years: int = 0) -> bool:
        """
        @param minutes: Количество минут для проверки (int).
        @param hours: Количество часов для проверки (int).
        @param days: Количество дней для проверки (int).
        @param months: Количество месяцев для проверки (int).
        @param years: Количество лет для проверки (int).
        @return: True, если указанный временной промежуток может вместиться в интервал.
        """
        total_minutes = (minutes + hours * 60 + days * 24 * 60 + months * 30 * 24 * 60 + years * 365 * 24 * 60)
        return self.minutes() >= total_minutes

    def starts_before(self, other: 'DateRange') -> bool:
        """
        @param other: Интервал для проверки (DateRange).
        @return: True, если текущий интервал начинается раньше другого.
        """
        return self.start < other.start

    def ends_after(self, other: 'DateRange') -> bool:
        """
        @param other: Интервал для проверки (DateRange).
        @return: True, если текущий интервал заканчивается позже другого.
        """
        return self.end > other.end

    def is_same_day(self) -> bool:
        """
        @return: True, если интервал находится в пределах одного дня.
        """
        return self.start.date() == self.end.date()

    def is_same_month(self) -> bool:
        """
        @return: True, если интервал находится в пределах одного месяца.
        """
        return self.start.year == self.end.year and self.start.month == self.end.month

    def is_same_year(self) -> bool:
        """
        @return: True, если интервал находится в пределах одного года.
        """
        return self.start.year == self.end.year

    def crosses_new_year(self) -> bool:
        """
        @return: True, если интервал пересекает Новый год.
        """
        return self.start.year != self.end.year

    def is_weekend_only(self) -> bool:
        """
        @return: True, если интервал состоит только из выходных.
        """
        current = self.start
        while current <= self.end:
            if current.weekday() < 5:
                return False
            current += timedelta(days=1)
        return True

    def append(self, minutes: int = 0, hours: int = 0, days: int = 0, months: int = 0, years: int = 0):
        """
        @param minutes: Количество минут для добавления (int).
        @param hours: Количество часов для добавления (int).
        @param days: Количество дней для добавления (int).
        @param months: Количество месяцев для добавления (int).
        @param years: Количество лет для добавления (int).
        @behavior: Изменяет текущий интервал, увеличивая его конец на указанный временной промежуток.
        """
        self.end += timedelta(minutes=minutes, hours=hours, days=days)
        self.end += relativedelta(months=months, years=years)

    def prepend(self, minutes: int = 0, hours: int = 0, days: int = 0, months: int = 0, years: int = 0):
        """
        @param minutes: Количество минут для добавления к началу (int).
        @param hours: Количество часов для добавления к началу (int).
        @param days: Количество дней для добавления к началу (int).
        @param months: Количество месяцев для добавления к началу (int).
        @param years: Количество лет для добавления к началу (int).
        @behavior: Изменяет текущий интервал, уменьшая его начало на указанный временной промежуток.
        """
        self.start -= timedelta(minutes=minutes, hours=hours, days=days)
        self.start -= relativedelta(months=months, years=years)

    def is_entirely_weekdays(self) -> bool:
        """
        @return: True, если интервал состоит только из будних дней.
        """
        current = self.start
        while current <= self.end:
            if current.weekday() >= 5:
                return False
            current += timedelta(days=1)
        return True

    def total_weekend_days(self) -> int:
        """
        @return: Количество выходных дней в интервале.
        """
        weekend_days = 0
        current = self.start
        while current <= self.end:
            if current.weekday() >= 5:
                weekend_days += 1
            current += timedelta(days=1)
        return weekend_days

    def starts_on_weekend(self) -> bool:
        """
        @return: True, если интервал начинается с выходного.
        """
        return self.start.weekday() >= 5

    def ends_on_weekend(self) -> bool:
        """
        @return: True, если интервал заканчивается на выходном.
        """
        return self.end.weekday() >= 5
