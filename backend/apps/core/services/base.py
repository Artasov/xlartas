# commerce/services/base.py
"""
Универсальный базовый сервис.

▪ Использует метакласс `ServiceMeta`, который агрегирует все контейнеры
  `exceptions` из иерархии наследования (учитывается и множественное
  наследование).
▪ Гарантирует, что атрибут `exceptions` есть у любого сервиса и содержит
  объединённый набор ошибок.
"""

from __future__ import annotations

from typing import Any, List, Type


class ServiceMeta(type):
    """Метакласс-агрегатор для контейнеров исключений."""

    # flake8 понимает docstring в одной строке, pylint — в две. :)
    def __new__(  # noqa: D401
            mcls: Type["ServiceMeta"],
            name: str,
            bases: tuple[type, ...],
            attrs: dict[str, Any],
            **kwargs: Any,
    ) -> "ServiceMeta":
        # 1. Собираем существующие контейнеры из базовых классов
        exception_bases: List[type] = [
            base.exceptions  # type: ignore[attr-defined]
            for base in bases
            if hasattr(base, 'exceptions')
        ]

        # 2. Проверяем, объявил ли разработчик собственный контейнер
        declared_raw: Any = (
                attrs.pop('Exceptions', None)  # вложенный класс
                or attrs.pop('exceptions', None)  # готовый атрибут
        )
        if isinstance(declared_raw, type):
            exception_bases.insert(0, declared_raw)

        # 3. Если контейнеров не осталось — создаём пустой класс
        if not exception_bases:
            aggregated: Type[Any] = type(f'{name}Exceptions', (), {})
        else:
            aggregated = type(f'{name}Exceptions', tuple(exception_bases), {}, )

        # 4. Делаем атрибут доступным в итоговом классе
        attrs['exceptions'] = aggregated

        # 5. Создаём и возвращаем класс
        return super().__new__(mcls, name, bases, attrs, **kwargs)


class BaseService(metaclass=ServiceMeta):
    """
    Корневой сервис, от которого наследуются все остальные.

    Наследник может расширить контейнер, объявив:
        class Exceptions: ...
        или
        exceptions = SomeContainer
    ― метакласс «подшивает» всё автоматически.
    """

    # Стартовый (пустой) контейнер: метакласс всё равно его заменит
    exceptions: Type[Any] = type('BaseExceptions', (), {})
