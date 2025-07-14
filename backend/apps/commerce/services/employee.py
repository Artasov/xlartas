# commerce/services/employee.py
from utils.log import get_global_logger
from datetime import timedelta
from typing import TYPE_CHECKING

from django.db import transaction
from django.db.models import Max
from django.utils import timezone

log = get_global_logger()

if TYPE_CHECKING:
    from apps.commerce.models import Employee


class EmployeeService:
    def auto_renewal_schedule(self: 'Employee', weeks_ahead: int = 4):
        """
        Гарантирует, что у сотрудника будет заполнено расписание на `weeks_ahead` недель вперёд,
        включая текущую неделю.

        1. Если у сотрудника нет интервалов на текущую неделю — ничего не копируем.
        2. Если есть, то считаем, сколько уже покрыто «недель», и достраиваем оставшиеся
           путём копирования только текущей недели (шаблон).
        3. Считаем неделю с понедельника 00:00:00 (локального времени).
        4. Интервалы копируются «как есть» со сдвигом на целые недели (7, 14, 21 дней и т.д.),
           без изменения секунд, минут или часов.
        """

        # Проверка: если автопродление выключено — выходим
        if not self.auto_schedule_renewal:
            log.info(f'[auto_renewal_schedule] Автопродление выключено для сотрудника {self.id}')
            return

        from apps.commerce.models import EmployeeAvailabilityInterval

        log.info(f'[auto_renewal_schedule] Запуск для сотрудника {self.id}, weeks_ahead={weeks_ahead}')

        # 1) Определяем границы текущей недели (локальное время)
        now_local = timezone.localtime()
        current_monday = now_local - timedelta(days=now_local.weekday())
        current_monday = current_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        next_monday = current_monday + timedelta(days=7)

        # 2) Берём интервалы текущей недели => это наш шаблон
        current_week_intervals = EmployeeAvailabilityInterval.objects.filter(
            user_id=self.pk,
            start__gte=current_monday,
            start__lt=next_monday
        ).order_by('start', 'end')

        if not current_week_intervals.exists():
            log.info(f'[auto_renewal_schedule] Нет интервалов на текущую неделю. Выходим.')
            return

        # 3) Смотрим, сколько уже покрыто недель от current_monday вплоть до самого дальнего future_end
        #    Будущие интервалы: start >= current_monday (то есть с текущей недели и дальше)
        all_intervals_from_current = EmployeeAvailabilityInterval.objects.filter(
            user_id=self.pk,
            start__gte=current_monday
        )
        max_end = all_intervals_from_current.aggregate(m=Max('end'))['m']
        if not max_end:
            # Нет расписания после текущего понедельника, значит покрыта только текущая неделя
            covered_weeks = 1
        else:
            # Вычисляем, сколько полных недель покрыто от current_monday до max_end
            # Пример: если max_end на 2.5 недели вперёд, значит покрыто 3 недели (округляем вверх)
            delta_days = (max_end - current_monday).days
            covered_weeks = (delta_days // 7) + 1  # +1, т.к. считаем 'частично покрытую' неделю

        log.info(
            f'[auto_renewal_schedule] У сотрудника {self.id} уже покрыто {covered_weeks} нед. Нужно {weeks_ahead}.')

        # 4) Если уже покрыто достаточно недель, ничего не добавляем
        if covered_weeks >= weeks_ahead:
            log.info(f'[auto_renewal_schedule] Уже покрыто {covered_weeks} недель, нужно {weeks_ahead}. Выходим.')
            return

        # 5) Копируем недостающие недели (шаблоном служит ТОЛЬКО текущая неделя)
        #    Например, если covered_weeks=1, а weeks_ahead=4, нужно добавить 3 недели.
        weeks_to_add = weeks_ahead - covered_weeks

        # Для удобства возьмём список шаблонных интервалов «current_week_intervals» в память
        template_list = list(current_week_intervals)

        for i in range(1, weeks_to_add + 1):
            # Например, если covered_weeks=1 => первая неделя, которую добавляем, будет offset=1*7
            #                                => вторая неделя offset=2*7, и т.д.
            target_week_start = current_monday + timedelta(days=7 * (covered_weeks + i - 1))
            target_week_end = target_week_start + timedelta(days=7)

            # Проверяем, нет ли уже интервалов в этой неделе
            existing = EmployeeAvailabilityInterval.objects.filter(
                user_id=self.pk,
                start__gte=target_week_start,
                start__lt=target_week_end
            )

            intervals_to_create = []
            delta = target_week_start - current_monday
            for tpl in template_list:
                new_start = tpl.start + delta
                new_end = tpl.end + delta

                # Проверяем пересечения
                overlap_exists = existing.filter(start__lt=new_end, end__gt=new_start).exists()
                if not overlap_exists:
                    intervals_to_create.append(EmployeeAvailabilityInterval(
                        user=tpl.user,
                        start=new_start,
                        end=new_end
                    ))

            if intervals_to_create:
                with transaction.atomic():
                    EmployeeAvailabilityInterval.objects.bulk_create(intervals_to_create)

            log.info(f'[auto_renewal_schedule] Добавили неделю {target_week_start.date()} -> {target_week_end.date()}.')

        log.info(f'[auto_renewal_schedule] Сотрудник {self.id} теперь покрыт на {weeks_ahead} недель вперёд.')
