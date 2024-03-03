import hashlib

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

    @staticmethod
    async def generate_signature(params, secret):
        sorted_params = sorted(params.items(), key=lambda x: x[0])
        string_params = '|'.join([str(v) for _, v in sorted_params])
        signature = hashlib.sha256(f'{string_params}|{secret}'.encode('utf-8')).hexdigest()
        return signature

    async def create_order(self, amount, currency, order_id, **kwargs):
        params = {
            'shopId': self.merchant_id,
            'nonce': kwargs.get('nonce', 123456789),
            'paymentId': order_id,
            'i': kwargs.get('i', 6),
            'email': kwargs.get('email', ''),
            'ip': kwargs.get('ip', ''),
            'amount': amount,
            'currency': currency,
        }
        signature = await self.generate_signature(params, self.api_key)
        params['signature'] = signature
        async with ClientSession() as session:
            async with session.post(f'{self.base_url}orders/create', json=params) as response:
                return await response.json()

    async def check_order_status(self, order_id):
        params = {
            'shopId': self.merchant_id,
            'nonce': 123456789,
            'orderId': order_id,
        }
        signature = await self.generate_signature(params, self.api_key)
        params['signature'] = signature
        async with ClientSession() as session:
            async with session.post(f'{self.base_url}orders', json=params) as response:
                return await response.json()
