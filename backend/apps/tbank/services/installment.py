# tbank/services/installment.py
import base64
import logging
from collections import namedtuple
from typing import TYPE_CHECKING

import aiohttp
from django.conf import settings

if TYPE_CHECKING:
    from apps.tbank.models import TBankInstallment
log = logging.getLogger('global')

InstallmentResponse = namedtuple(
    'InstallmentResponse',
    ['ok', 'data', 'status_code']
)


class TBankInstallmentException(Exception):
    pass


class TBankInstallmentService:
    """
    Миксин, подключённый к модели TBankInstallment,
    реализует методы Create / Commit / Cancel / Info
    по API Тинькофф Формы.
    """

    @property
    def shop_id(self) -> str:
        return settings.TBANK_SHOP_ID

    @property
    def showcase_id(self) -> str:
        return settings.TBANK_SHOWCASE_ID

    @property
    def api_password(self) -> str:
        return settings.TBANK_INSTALLMENT_PASSWORD

    @property
    def base_url(self) -> str:
        return 'https://forma.tinkoff.ru/api/partners/v2/orders'

    def _basic_auth_headers(self: 'TBankInstallment') -> dict:
        # Если демо => login = f'demo-{self.showcase_id}'
        login = self.showcase_id
        if self.is_demo:
            login = f'demo-{login}'
        auth_str = f'{login}:{self.api_password}'
        encoded = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
        return {
            'Authorization': f'Basic {encoded}',
            'Content-Type': 'application/json'
        }

    @staticmethod
    async def _post_json(url: str, data: dict, headers: dict = None, demo=True):
        url = url + '-demo' if demo else url
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as resp:
                resp_data = await resp.json()
                if resp.status != 200:
                    raise ValueError(f'Request error {resp.status}: {resp_data}')
                return resp_data

    @staticmethod
    async def _get_json(url: str, headers: dict):
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                resp_data = await resp.json()
                if resp.status != 200:
                    raise ValueError(f'Request error {resp.status}: {resp_data}')
                return resp_data

    # ---------------------------
    # 1) Create
    # ---------------------------
    async def create_installment(
            self: 'TBankInstallment',
            total_sum: int,
            items: list[dict],
            webhook_url: str = None,
            success_url: str = None,
            fail_url: str = None,
            return_url: str = None,
            promo_code: str = 'default',
            contact_values: dict = None,
    ):
        """
        Создание заявки (POST /create).
        total_sum — сумма в копейках
        items     — [{name, price, quantity, ...}, ...]
        """
        from apps.tbank.models import TBankInstallmentStatus
        create_url = f'{self.base_url}/create'
        data = {
            'shopId': self.shop_id,
            'showcaseId': self.showcase_id,
            'sum': total_sum,
            'items': items,
            # orderNumber должен быть, т.к. у вас commit/cancel/info
            'orderNumber': str(self.order_id),
            'promoCode': promo_code,
        }
        if webhook_url:  data['webhookURL'] = webhook_url
        if success_url:  data['successURL'] = success_url
        if fail_url:     data['failURL'] = fail_url
        if return_url:   data['returnURL'] = return_url
        # Если нужно передавать demoFlow => self.is_demo
        if self.is_demo:
            data['demoFlow'] = 'sms'
        if contact_values:
            data['values'] = {'contact': contact_values}
        log.info(f'TBankInstallment create request {data}')
        response_data = await self._post_json(create_url, data, headers=None)

        """
          Ожидаем, что вернётся {'id': '...', 'link': '...'}
          'id' = ID заявки в TCB
          'link' = ссылка на форму
        """
        self.status = TBankInstallmentStatus.NEW  # TODO: Instance attribute status defined outside __init__
        self.payment_url = response_data.get('link')  # TODO: Instance attribute payment_url defined outside __init__
        await self.asave()
        return response_data  # может пригодиться

    # ---------------------------
    # 2) Commit
    # ---------------------------
    async def commit_installment(self: 'TBankInstallment'):
        """
        Подтверждение заявки (POST /{orderNumber}/commit).
        """
        url = f'{self.base_url}/{self.order_id}/commit'
        headers = self._basic_auth_headers()
        resp = await self._post_json(url, data={}, headers=headers)

        # resp содержит {'status': '...', 'committed': ..., ...}
        self.status = resp.get('status', self.status)  # TODO: Instance attribute status defined outside __init__
        self.committed = bool(resp.get('committed', False))  # TODO: Instance attribute committed defined outside __init__
        await self.asave()
        return resp

    # ---------------------------
    # 3) Cancel
    # ---------------------------
    async def cancel_installment(self: 'TBankInstallment'):
        """
        Отмена заявки (POST /{orderNumber}/cancel).
        """
        url = f'{self.base_url}/{self.order_id}/cancel'
        headers = self._basic_auth_headers()
        resp = await self._post_json(url, data={}, headers=headers)

        self.status = resp.get('status', self.status)  # TODO: Instance attribute status defined outside __init__
        self.committed = bool(resp.get('committed', False))  # TODO: Instance attribute committed defined outside __init__
        await self.asave()
        return resp

    # ---------------------------
    # 4) Info
    # ---------------------------
    async def info_installment(self: 'TBankInstallment'):
        """
        Текущее состояние заявки (GET /{orderNumber}/info).
        """
        url = f'{self.base_url}/{self.order_id}/info'
        headers = self._basic_auth_headers()
        resp = await self._get_json(url, headers=headers)

        self.status = resp.get('status', self.status)  # TODO: Instance attribute status defined outside __init__
        self.committed = bool(resp.get('committed', False))  # TODO: Instance attribute committed defined outside __init__
        await self.asave()
        return resp
