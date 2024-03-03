import hashlib
import hmac
from datetime import datetime

from aiohttp import ClientSession
from django.conf import settings


class FreeKassa:
    def __init__(self,
                 merchant_id=settings.FK_MERCHANT_ID,
                 secret1=settings.FK_SECRET_WORD1,
                 secret2=settings.FK_SECRET_WORD2,
                 api_key=settings.FK_API_KEY):
        self.merchant_id = merchant_id
        self.secret1 = secret1
        self.secret2 = secret2
        self.api_key = api_key
        self.base_url = 'https://api.freekassa.ru/v1/'

    def _get_signature(self, params):
        sorted_params = sorted(params.items(), key=lambda x: x[0])
        string_params = '|'.join([str(v) for _, v in sorted_params])
        hash_object = hmac.new(self.api_key.encode(), string_params.encode(), hashlib.sha256)
        return hash_object.hexdigest()

    async def create_order(self, amount, currency, order_id, **kwargs):
        params = {
            'shopId': self.merchant_id,
            'nonce': 123456789 + int(datetime.now().timestamp()),
            'paymentId': order_id,
            'i': kwargs.get('i', 6),
            'email': kwargs.get('email', ''),
            'ip': kwargs.get('ip', ''),
            'amount': amount,
            'currency': currency,
        }
        # Используем _get_signature для создания подписи
        signature = self._get_signature(params)
        params['signature'] = signature
        async with ClientSession() as session:
            async with session.post(f'{self.base_url}orders/create', json=params) as response:
                return await response.json()

    async def check_order_status(self, order_id):
        params = {
            'shopId': self.merchant_id,
            'nonce': 123456789 + int(datetime.now().timestamp()),
            'orderId': order_id,
        }
        # Используем _get_signature для создания подписи
        signature = self._get_signature(params)
        params['signature'] = signature
        async with ClientSession() as session:
            async with session.post(f'{self.base_url}orders', json=params) as response:
                return await response.json()
