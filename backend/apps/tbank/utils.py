# tbank/utils.py
"""Utility helpers for interacting with TBank API."""
from __future__ import annotations

import hashlib
import json
import logging
from collections import OrderedDict
from json import JSONEncoder
from typing import Any, Dict

import aiohttp
import uuid6
from django.conf import settings
from phonenumbers import PhoneNumber

log = logging.getLogger('tbank')


class CustomTBankJsonEncoder(JSONEncoder):
    """JSON encoder that knows how to serialise UUID and PhoneNumber objects."""

    def default(self, obj: Any) -> Any:  # noqa: D401
        if isinstance(obj, uuid6.UUID):
            return str(obj)
        if isinstance(obj, PhoneNumber):
            return str(obj)
        return super().default(obj)


def replace_none_with_string(data: Any) -> Any:
    """Recursively replace ``None`` values with the string ``'None'``."""
    if isinstance(data, dict):
        return {k: replace_none_with_string(v) for k, v in data.items()}
    if isinstance(data, list):
        return [replace_none_with_string(v) for v in data]
    if data is None:
        return 'None'
    return data


def remove_none_values(data: Any, exclude_keys: list[str] | None = None) -> Any:
    """Recursively drop ``None`` values from dictionaries and lists."""
    if exclude_keys is None:
        exclude_keys = []
    if isinstance(data, dict):
        return {
            k: remove_none_values(v, exclude_keys)
            for k, v in data.items()
            if v is not None or k in exclude_keys
        }
    if isinstance(data, list):
        return [remove_none_values(item, exclude_keys) for item in data]
    return data


def generate_token(notification: Dict[str, Any]) -> str:
    """Calculate request token according to Tinkoff specification."""
    params = {
        k: v
        for k, v in notification.items()
        if k not in {'Shops', 'DATA', 'Receipt', 'Token'}
    }
    for key, value in list(params.items()):
        if value is None:
            params[key] = 'None'
        if params[key] == 'True':
            params[key] = 'true'
        elif params[key] == 'False':
            params[key] = 'false'
        elif isinstance(value, bool):
            params[key] = 'true' if value else 'false'
    params['Password'] = settings.TBANK_PASSWORD
    sorted_parameters = OrderedDict(sorted(params.items()))
    concatenated_values = ''.join(str(sorted_parameters[key]) for key in sorted_parameters)
    return hashlib.sha256(concatenated_values.encode('utf-8')).hexdigest()


async def post(base_url: str, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Send POST request to ``endpoint`` using aiohttp."""
    data = replace_none_with_string(data)
    async with aiohttp.ClientSession() as session:
        serialized_data = json.dumps(data, cls=CustomTBankJsonEncoder)
        headers = {'Content-Type': 'application/json'}
        log.info('POST %s%s', base_url, endpoint)
        log.info(serialized_data)
        async with session.post(base_url + endpoint, data=serialized_data, headers=headers) as response:
            log.info('POST RESPONSE %s%s', base_url, endpoint)
            response_json = await response.json()
            response_text = await response.text()
            response_status_code = response.status
            log.info('%s', response_json)
            log.info('%s', response_text)
            log.info('%s', response_status_code)
            return response_json


async def request(base_url: str, terminal_key: str, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare params with terminal key and token and send POST."""
    params = dict(params)
    params['TerminalKey'] = terminal_key
    params['Token'] = generate_token(params)
    return await post(base_url, endpoint, params)
