# core/services/user.py
import string
from random import choices
from typing import TYPE_CHECKING

from adjango.querysets.base import AQuerySet
from adjango.utils.base import calculate_age
from django.db import transaction, connection

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import DonateOrder
    from apps.software.models import SoftwareOrder
    from apps.commerce.models import GiftCertificateOrder


def generate_random_username():
    return 'U' + ''.join(choices(string.ascii_uppercase + string.digits, k=11))


class UserService:
    @property
    def donate_orders(self: 'User') -> AQuerySet['DonateOrder']:
        from apps.xlmine.models import DonateOrder
        return DonateOrder.objects.filter(user_id=self.id)

    @property
    def software_orders(self: 'User') -> AQuerySet['SoftwareOrder']:
        from apps.software.models import SoftwareOrder
        return SoftwareOrder.objects.filter(user_id=self.id)

    @property
    def gift_certificate_orders(self: 'User') -> AQuerySet['GiftCertificateOrder']:
        from apps.commerce.models import GiftCertificateOrder
        return GiftCertificateOrder.objects.filter(user_id=self.id)

    @property
    def age(self: 'User'):
        return calculate_age(self.birth_date)

    @property
    def full_name(self: 'User'):
        return ' '.join([i for i in [self.last_name, self.first_name, self.middle_name] if i])

    def change_id(self: 'User', new_id: int):
        old_id = self.id
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Обновляем id пользователя
                cursor.execute("""
                            UPDATE core_user
                            SET id = %s
                            WHERE id = %s;
                        """, [new_id, old_id])

                # Обновляем все внешние ссылки в других таблицах
                cursor.execute("""
                            UPDATE django_admin_log
                            SET user_id = %s
                            WHERE user_id = %s;
                        """, [new_id, old_id])

                # Добавьте здесь обновления для всех других таблиц, содержащих внешние ключи на core_user.id

                # Обновляем последовательность, если используется PostgreSQL
                cursor.execute("""
                            SELECT setval(pg_get_serial_sequence('core_user', 'id'), (SELECT MAX(id) FROM core_user));
                        """)

            # Обновляем объект пользователя в текущей сессии
            self.id = new_id  # noqa
