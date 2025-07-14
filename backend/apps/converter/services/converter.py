# converter/services/converter.py
import shutil
from abc import ABC, abstractmethod
from datetime import timedelta
from typing import Optional, Type

try:
    from PIL import Image
except Exception:  # pragma: no cover - Pillow may not be installed
    Image = None

try:
    from pydub import AudioSegment
except Exception:  # pragma: no cover - pydub may not be installed
    AudioSegment = None

from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.converter.models import Conversion, Format
from apps.core.models import User
from django.conf import settings


class BaseConverter(ABC):
    format: Format

    def __init__(self, conversion: Conversion) -> None:
        self.conversion = conversion

    @abstractmethod
    async def convert(self) -> None:
        """Perform conversion and save result to conversion.output_file"""
        pass

    async def finalize(self, dst: str) -> None:
        """Save conversion result path and mark conversion as done."""
        self.conversion.output_file.name = dst
        self.conversion.is_done = True
        await self.conversion.asave()


class DummyConverter(BaseConverter):
    async def convert(self) -> None:
        # just copy input to output
        src = self.conversion.input_file.path
        dst = src + f'.{self.conversion.target_format.name}'
        shutil.copy(src, dst)
        await self.finalize(dst)


class ImageConverter(BaseConverter):
    async def convert(self) -> None:
        """
        Конвертируем изображение в требуемый формат, корректируя режим,
        если целевой формат не поддерживает альфу (например, JPEG).
        Pillow выбросит «cannot write mode RGBA as JPEG», если попытаться
        сохранить картинку с альфа-каналом напрямую – поэтому переводим
        такие изображения в RGB или «сплющиваем» их на белый фон.
        """
        src = self.conversion.input_file.path
        ext = self.conversion.target_format.name.lower()  # 'jpg', 'png', …
        dst = f"{src}.{ext}"

        if Image:  # Pillow установлен
            # '.jpg' → 'JPEG', '.tif' → 'TIFF', и т. д.
            save_fmt = Image.registered_extensions().get(f".{ext}", ext.upper())

            with Image.open(src) as im:
                img = im  # не трогаем оригинал

                # --- JPEG не умеет прозрачность и CMYK → преобразуем в RGB ---
                if save_fmt in {"JPEG", "JPG", "JFIF"}:
                    if img.mode in {"RGBA", "LA", "P"}:
                        # «Сплющиваем» на белый фон, сохраняя изображение
                        bg = Image.new("RGB", img.size, (255, 255, 255))

                        # P-палитру сначала в RGBA → получаем альфу
                        if img.mode == "P":
                            img = img.convert("RGBA")

                        alpha = img.split()[-1] if img.mode in {"RGBA", "LA"} else None
                        bg.paste(img.convert("RGBA"), mask=alpha)
                        img = bg
                    elif img.mode != "RGB":  # CMYK, 1, I, …
                        img = img.convert("RGB")

                # --- сохраняем ---
                img.save(dst, save_fmt)
        else:  # pragma: no cover
            shutil.copy(src, dst)

        await self.finalize(dst)


class AudioConverter(BaseConverter):
    async def convert(self) -> None:
        src = self.conversion.input_file.path
        dst = src + f'.{self.conversion.target_format.name}'
        if AudioSegment:
            audio = AudioSegment.from_file(src)
            audio.export(dst, format=self.conversion.target_format.name)
        else:  # pragma: no cover - fallback when pydub missing
            shutil.copy(src, dst)
        await self.finalize(dst)


class ConversionService:
    RATE_LIMIT_ANON = 10
    RATE_LIMIT_AUTH = 50
    MAX_FILE_SIZE = settings.MAX_CONVERTER_FILE_SIZE

    AUDIO_FORMATS = {"mp3", "wav", "ogg", "flac", "aac"}
    IMAGE_FORMATS = {"jpg", "jpeg", "png", "gif", "bmp", "tiff"}

    def __init__(self, conversion: Conversion):
        self.conversion = conversion

    async def detect_converter(self) -> Type[BaseConverter]:
        target = await self.conversion.arelated('target_format')
        fmt = target.name.lower()
        if fmt in self.AUDIO_FORMATS:
            return AudioConverter
        if fmt in self.IMAGE_FORMATS:
            return ImageConverter
        return DummyConverter

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
    async def remaining_attempts(cls, user: Optional[User], ip: str) -> int:
        time_threshold = timezone.now() - timedelta(hours=1)
        qs = Conversion.objects.filter(created_at__gte=time_threshold, ip=ip)
        if user:
            qs = qs.filter(user=user)
            limit = cls.RATE_LIMIT_AUTH
        else:
            qs = qs.filter(user__isnull=True)
            limit = cls.RATE_LIMIT_ANON
        count = await qs.acount()
        remaining = limit - count
        return remaining if remaining > 0 else 0

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
            output_name: str | None = None,
    ) -> Conversion:
        if input_file.size > cls.MAX_FILE_SIZE:
            raise ValueError(_('File too large'))
        if not await cls.check_rate_limit(user, ip):
            raise ValueError(_('Rate limit exceeded'))
        conversion = await Conversion.objects.acreate(
            user=user,
            ip=ip,
            input_file=input_file,
            source_format=source_format,
            target_format=target_format,
            params=params or {},
            output_name=output_name,
        )
        from apps.converter.tasks import process_conversion_task
        process_conversion_task.delay(conversion.id)
        return conversion

    async def perform(self, converter_cls: Type[BaseConverter] | None = None) -> None:
        converter_cls = converter_cls or await self.detect_converter()
        converter = converter_cls(self.conversion)
        await converter.convert()
