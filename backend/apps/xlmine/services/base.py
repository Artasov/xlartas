# xlmine/services/base.py
import hashlib


def increment_version(version_str: str) -> str:
    try:
        parts = version_str.split('.')
        if len(parts) < 3:
            parts += ['0'] * (3 - len(parts))
        major, minor, patch = map(int, parts[:3])
        minor += 1
        return f"{major}.{minor}.{patch}"
    except Exception:
        return "1.0.0"


def calculate_sha256(file):
    hash_sha256 = hashlib.sha256()
    pos = file.tell()  # сохраняем позицию
    file.seek(0)
    for chunk in file.chunks():
        hash_sha256.update(chunk)
    file.seek(pos)  # возвращаем позицию
    return hash_sha256.hexdigest()
