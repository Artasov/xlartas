from typing import TYPE_CHECKING

from adjango.querysets.base import AQuerySet
from adjango.utils.base import calculate_age
from django.db import transaction, connection

from apps.commerce.services.user import CommerceUserService
from apps.xlmine.services.donate import UserDonateService
from apps.xlmine.services.privilege import UserPrivilegeService
from apps.xlmine.services.user import UserXLMineService

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder
    from apps.commerce.models import GiftCertificateOrder


class UserService(
    UserDonateService,
    UserXLMineService,
    UserPrivilegeService,
    CommerceUserService
):
    @property
    def age(self):
        return calculate_age(self.user.birth_date)

    @property
    def full_name(self):
        return ' '.join([i for i in [self.user.last_name, self.user.first_name, self.user.middle_name] if i])

    @property
    def software_orders(self) -> AQuerySet['SoftwareOrder']:
        from apps.software.models import SoftwareOrder
        return SoftwareOrder.objects.filter(user_id=self.id)

    @property
    def gift_certificate_orders(self) -> AQuerySet['GiftCertificateOrder']:
        from apps.commerce.models import GiftCertificateOrder
        return GiftCertificateOrder.objects.filter(user_id=self.user.id)

    def change_id(self, new_id: int):
        old_id = self.user.id
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
