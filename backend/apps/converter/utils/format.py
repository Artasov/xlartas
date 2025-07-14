# converter/utils/format.py
"""
utils/converter_capabilities.py
Определяем, какие форматы нам доступны в рантайме.
"""
from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Set

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None

try:
    from pydub import AudioSegment
except Exception:  # pragma: no cover
    AudioSegment = None


def get_supported_image_formats() -> Set[str]:
    """
    Возвращает множество расширений картинок, которые Pillow может *сохранить* (`SAVE`),
    например {'png', 'jpg', 'jpeg', 'webp', 'bmp', …}

    Pillow хранит сведения в двух местах:
      * Image.SAVE  – маппинг `{format_name: save_handler}`
      * Image.registered_extensions() – маппинг `{'.jpg': 'JPEG', …}`

    Нам нужен именно список расширений, поэтому берём registered_extensions().
    """
    if Image is None:  # Pillow не установлен
        return set()

    return {ext.lstrip(".").lower() for ext in Image.registered_extensions()}


_FF_RE = re.compile(r"^\s*[D\s][E\s]\s+(\w+)", re.I)


def get_supported_audio_formats() -> Set[str]:
    """
    Возвращает множество контейнеров/кодеков, которые ffmpeg умеет *экспортировать*
    (т.е. «E» – encode). pydub использует тот же ffmpeg, поэтому достаточно
    проанализировать вывод `ffmpeg -formats`.

    Пример строки в выводе:
        DE mp3             MPEG audio layer 3

    Здесь «D» – decode, «E» – encode. Нас интересуют форматы, у которых есть «E».
    """
    if AudioSegment is None:  # pydub/ffmpeg не установлены
        return set()

    ffmpeg_bin = AudioSegment.converter or "ffmpeg"  # путь до ffmpeg
    if not Path(ffmpeg_bin).exists():
        return set()

    try:
        proc = subprocess.run(
            [ffmpeg_bin, "-hide_banner", "-formats"],
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.SubprocessError:
        return set()

    formats: set[str] = set()
    for line in proc.stdout.splitlines():
        m = _FF_RE.match(line)
        if m:
            formats.add(m.group(1).lower())

    return formats
