import shutil
from abc import ABC, abstractmethod
from datetime import timedelta
from typing import Optional, Type

from django.utils import timezone

from apps.converter.models import Conversion, Format
from apps.core.models import User


class BaseConverter(ABC):
    format: Format

    def __init__(self, conversion: Conversion) -> None:
        self.conversion = conversion

    @abstractmethod
    async def convert(self) -> None:
        """Perform conversion and save result to conversion.output_file"""
        pass


class DummyConverter(BaseConverter):
    async def convert(self) -> None:
        # just copy input to output
        src = self.conversion.input_file.path
        dst = src + f'.{self.conversion.target_format.name}'
        shutil.copy(src, dst)
        self.conversion.output_file.name = dst
        self.conversion.is_done = True
        await self.conversion.asave()


class ConversionService:
    RATE_LIMIT_ANON = 10
    RATE_LIMIT_AUTH = 50

    def __init__(self, conversion: Conversion):
        self.conversion = conversion

    @classmethod
    async def check_rate_limit(cls, user: Optional[User], ip: str) -> bool:
        time_threshold = timezone.now() - timedelta(hours=1)
        qs = Conversion.objects.filter(created_at__gte=time_threshold, ip=ip)
        if user:
            qs = qs.filter(user=user)
            limit = cls.RATE_LIMIT_AUTH
        else:
            qs = qs.filter(user__isnull=True)
            limit = cls.RATE_LIMIT_ANON
        count = await qs.acount()
        return count < limit

    @classmethod
    async def create(
        cls,
        *,
        user: Optional[User],
        ip: str,
        input_file,
        source_format: Format,
        target_format: Format,
        params: dict | None = None,
    ) -> Conversion:
        if not await cls.check_rate_limit(user, ip):
            raise ValueError('Rate limit exceeded')
        conversion = await Conversion.objects.acreate(
            user=user,
            ip=ip,
            input_file=input_file,
            source_format=source_format,
            target_format=target_format,
            params=params or {},
        )
        from apps.converter.tasks import process_conversion_task
        process_conversion_task.delay(conversion.id)
        return conversion

    async def perform(self, converter_cls: Type[BaseConverter] | None = None) -> None:
        converter_cls = converter_cls or DummyConverter
        converter = converter_cls(self.conversion)
        await converter.convert()
