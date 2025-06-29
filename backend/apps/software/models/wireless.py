# software/models/wireless.py
from django.conf import settings
from django.db.models import ForeignKey, Model, CASCADE, PositiveIntegerField, CharField


class WirelessMacro(Model):
    """
    Хранит имя макроса, которое пользователь может быстро отправить
    из веб-панели, и его относительный приоритет в списке.
    """
    owner = ForeignKey(settings.AUTH_USER_MODEL, CASCADE, 'wireless_macros')
    name = CharField(max_length=100)
    priority = PositiveIntegerField(default=0)

    class Meta:
        ordering = ('priority', 'name')
        unique_together = ('owner', 'name')

    def __str__(self) -> str:  # type: ignore[override]
        return f'{self.name} ({self.owner})'
