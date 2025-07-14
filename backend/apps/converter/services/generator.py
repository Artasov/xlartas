# converter/services/generator.py
from __future__ import annotations

import json
from typing import Iterable

from apps.converter.models import (
    Format,
    Parameter,
    ParameterOption,
    ConversionVariant,
)

AUDIO_FORMATS = [
    "mp3",
    "wav",
    "flac",
    "ogg",
    "aac",
    "m4a",
]

IMAGE_FORMATS = [
    "jpg",
    "png",
    "gif",
    "bmp",
    "tiff",
    "webp",
]

VIDEO_FORMATS = [
    "mp4",
    "avi",
    "mkv",
    "mov",
    "webm",
]

AUDIO_PARAMS = [
    {
        "name": "bitrate",
        "type": "select",
        "unit": "kbps",
        "options": [64, 96, 128, 192, 256, 320],
        "default_value": None,
    },
    {
        "name": "sample_rate",
        "type": "select",
        "unit": "Hz",
        "options": [22050, 44100, 48000],
        "default_value": None,
    },
    {
        "name": "channels",
        "type": "select",
        "options": [1, 2],
        "default_value": None,
    },
]

IMAGE_PARAMS = [
    {
        "name": "width",
        "type": "int",
        "unit": "px",
        "min_value": 1,
        "default_value": None,
    },
    {
        "name": "height",
        "type": "int",
        "unit": "px",
        "min_value": 1,
        "default_value": None,
    },
    {
        "name": "quality",
        "type": "int",
        "unit": "%",
        "min_value": 1,
        "max_value": 100,
        "default_value": None,
    },
]

VIDEO_PARAMS = [
    {
        "name": "width",
        "type": "int",
        "unit": "px",
        "min_value": 1,
        "default_value": None,
    },
    {
        "name": "height",
        "type": "int",
        "unit": "px",
        "min_value": 1,
        "default_value": None,
    },
    {
        "name": "framerate",
        "type": "select",
        "unit": "fps",
        "options": [24, 30, 60],
        "default_value": None,
    },
    {
        "name": "video_bitrate",
        "type": "int",
        "unit": "kbps",
        "min_value": 100,
        "max_value": 50000,
        "default_value": None,
    },
]


def _clone_params(params: list[dict]) -> list[dict]:
    return [p.copy() for p in params]


def build_default_config() -> dict:
    formats = []
    for name in AUDIO_FORMATS:
        formats.append({"name": name, "parameters": _clone_params(AUDIO_PARAMS)})
    for name in IMAGE_FORMATS:
        formats.append({"name": name, "parameters": _clone_params(IMAGE_PARAMS)})
    for name in VIDEO_FORMATS:
        formats.append({"name": name, "parameters": _clone_params(VIDEO_PARAMS)})

    variants: list[dict] = []
    for group in (AUDIO_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS):
        for src in group:
            targets = [t for t in group if t != src]
            variants.append({"source": src, "targets": targets})

    return {"formats": formats, "variants": variants}


def load_default_converter_data() -> None:
    """Populate database with default converter formats and parameters."""
    load_converter_data(build_default_config())


def load_converter_data(data: dict) -> None:
    """Create formats, parameters and conversion variants from dictionary."""
    name_map: dict[str, Format] = {}
    for fmt_data in data.get("formats", []):
        fmt, _ = Format.objects.get_or_create(name=fmt_data["name"])
        if fmt_data.get("icon") is not None:
            fmt.icon = fmt_data["icon"]
            fmt.save(update_fields=["icon"])
        name_map[fmt.name] = fmt
        for p in fmt_data.get("parameters", []):
            param, _ = Parameter.objects.get_or_create(
                format=fmt,
                name=p["name"],
                defaults={
                    "type": p["type"],
                    "unit": p.get("unit"),
                    "min_value": p.get("min_value"),
                    "max_value": p.get("max_value"),
                    "default_value": p.get("default_value"),
                },
            )
            if "options" in p:
                for value in p["options"]:
                    ParameterOption.objects.get_or_create(parameter=param, value=value)

    for variant in data.get("variants", []):
        src = name_map.get(variant["source"]) or Format.objects.get(name=variant["source"])
        conv_var, _ = ConversionVariant.objects.get_or_create(source=src)
        targets: Iterable[Format] = [
            name_map.get(t) or Format.objects.get(name=t) for t in variant.get("targets", [])
        ]
        conv_var.targets.set(targets)


def load_converter_data_from_file(path: str) -> None:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    load_converter_data(data)
