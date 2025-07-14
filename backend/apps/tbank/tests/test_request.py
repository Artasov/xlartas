# tbank/tests/test_request.py
import pytest

from apps.tbank.classes.TBank import TBank
from apps.tbank.utils import request, generate_token


@pytest.mark.asyncio
async def test_request_adds_terminal_and_token(monkeypatch, settings):
    settings.TBANK_PASSWORD = "pass"
    tb = TBank(terminal_key="terminal", password="pass")
    captured = {}

    async def fake_post(base_url, endpoint, data):
        captured['base_url'] = base_url
        captured['endpoint'] = endpoint
        captured['data'] = data
        return {"ok": True}

    monkeypatch.setattr('apps.tbank.utils.post', fake_post)

    result = await request(tb.base_url, tb.terminal_key, "SomeEndpoint", {"foo": "bar"})

    assert result == {"ok": True}
    assert captured['endpoint'] == "SomeEndpoint"
    assert captured['base_url'] == tb.base_url
    assert captured['data']['TerminalKey'] == "terminal"
    assert captured['data']['Token'] == generate_token(captured['data'])
