# uuid6/utils.py
import re


def is_uuid_v6(uuid_str) -> bool:
    # Регулярное выражение для UUIDv6
    uuid_v6_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_v6_pattern.match(uuid_str))
