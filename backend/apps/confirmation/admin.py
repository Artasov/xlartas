# confirmation/admin.py
from django.contrib import admin
from polymorphic.admin import (
    PolymorphicParentModelAdmin,
    PolymorphicChildModelAdmin,
    PolymorphicChildModelFilter,
)

from apps.confirmation.models.base import ConfirmationCode, EmailConfirmationCode, PhoneConfirmationCode


# Базовая админка для дочерних моделей
class BaseConfirmationCodeChildAdmin(PolymorphicChildModelAdmin):
    """Базовая админка для всех типов ConfirmationCode."""
    base_model = ConfirmationCode
    list_display = ('user', 'action', 'code', 'is_used', 'expired_at')
    search_fields = ('user__username', 'action', 'code')
    list_filter = ('is_used',)


# Админка для модели EmailConfirmationCode
@admin.register(EmailConfirmationCode)
class EmailConfirmationCodeAdmin(BaseConfirmationCodeChildAdmin):
    """Админка для EmailConfirmationCode."""
    pass


# Админка для модели PhoneConfirmationCode
@admin.register(PhoneConfirmationCode)
class PhoneConfirmationCodeAdmin(BaseConfirmationCodeChildAdmin):
    """Админка для PhoneConfirmationCode."""
    pass


# Родительская админка для ConfirmationCode
@admin.register(ConfirmationCode)
class ConfirmationCodeParentAdmin(PolymorphicParentModelAdmin):
    """Родительская админка для ConfirmationCode и её дочерних моделей."""
    base_model = ConfirmationCode
    child_models = (EmailConfirmationCode, PhoneConfirmationCode)

    list_display = ('user', 'action', 'code', 'is_used', 'expired_at', 'polymorphic_ctype')
    list_filter = (PolymorphicChildModelFilter, 'is_used')  # Добавляем фильтр по типу модели
    search_fields = ('user__username', 'action', 'code')
    save_on_top = True
