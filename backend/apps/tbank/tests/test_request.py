import pytest

from apps.tbank.classes.TBank import TBank


@pytest.mark.asyncio
async def test_request_adds_terminal_and_token(monkeypatch, settings):
    settings.TBANK_PASSWORD = "pass"
    tb = TBank(terminal_key="terminal", password="pass")
    captured = {}

    async def fake_post(endpoint, data):
        captured['endpoint'] = endpoint
        captured['data'] = data
        return {"ok": True}

    monkeypatch.setattr(tb, "_post", fake_post)

    result = await tb._request("SomeEndpoint", {"foo": "bar"})

    assert result == {"ok": True}
    assert captured['endpoint'] == "SomeEndpoint"
    assert captured['data']['TerminalKey'] == "terminal"
    assert captured['data']['Token'] == tb._generate_token(captured['data'])
