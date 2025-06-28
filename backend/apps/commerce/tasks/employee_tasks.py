# commerce/tasks/employee_tasks.py
import logging

from adjango.utils.common import traceback_str
from celery import shared_task

from apps.commerce.models import Employee

log = logging.getLogger('global')


@shared_task
def auto_renewal_employees_schedules():
    for emp in Employee.objects.filter(auto_schedule_renewal=True):
        try:
            emp.auto_renewal_schedule()
        except Exception as e:
            log.critical(f'Ошибка при обработке сотрудника {emp.id}: {traceback_str(e)}')
