import hmac
import time

import requests
import hashlib
import json

from django.conf import settings


from django.db import models
from django.utils import timezone


class Currency(models.TextChoices):
    # Format: Member_Name = "database_value", "Human-Readable Name"
    FK = "1", "FK"
    WALLET = "2", "WALLET"
    RUB = "3", "RUB"
    USD = "4", "USD"
    EUR = "5", "EUR"
    VISA_RUB = "6", "VISA RUB"
    UAH = "7", "UAH"
    MASTER_CARD_RUB = "8", "MasterCard RUB"
    MASTER_CARD_UAH = "9", "MasterCard UAH"
    QIWI = "10", "Qiwi"
    VISA_EUR = "11", "VISA EUR"
    MIR = "12", "МИР"
    ONLINE_BANK = "13", "Онлайн банк"
    USDT_ERC20 = "14", "USDT(ERC20)"
    USDT_TRC20 = "15", "USDT(TRC20)"
    BITCOIN_CASH = "16", "Bitcoin Cash"
    BNB = "17", "BNB"
    DASH = "18", "DASH"
    DOGECOIN = "19", "Dogecoin"
    ZCASH = "20", "ZCash"
    MONERO = "21", "Monero"
    WAVES = "22", "Waves"
    RIPPLE = "23", "Ripple"
    BITCOIN = "24", "Bitcoin"
    LITECOIN = "25", "Litecoin"
    ETHEREUM = "26", "Ethereum"
    STEAMPAY = "27", "SteamPay"
    MEGAFON = "28", "Мегафон"
    VISA_USD = "32", "VISA USD"
    PERFECT_MONEY_USD = "33", "Perfect Money USD"
    SHIBA_INU = "34", "Shiba Inu"
    QIWI_API = "35", "QIWI API"
    CARD_RUB_API = "36", "Card RUB API"
    GOOGLE_PAY = "37", "Google Pay"
    APPLE_PAY = "38", "Apple Pay"
    TRON = "39", "Tron"
    WEBMONEY_WMZ = "40", "Webmoney WMZ"
    VISA_MASTER_CARD_KZT = "41", "VISA / MasterCard KZT"
    SBP = "42", "СБП"

def generate_signature(data, api_key=settings.FK_API_KEY):
    sorted_data = sorted(data.items(), key=lambda x: x[0])
    data_string = '|'.join([str(value) for _, value in sorted_data])
    signature = hmac.new(api_key.encode('utf-8'), data_string.encode('utf-8'), hashlib.sha256).hexdigest()
    return signature

def send_request(endpoint, data, api_key=settings.FK_API_KEY):
    data['signature'] = generate_signature(data, api_key)
    response = requests.post(settings.FK_API_URL + endpoint, json=data)
    response_data = json.loads(response.text)
    return response_data


def get_balance(shop_id=settings.FK_MERCHANT_ID, api_key=settings.FK_API_KEY):
    data = {
        'shopId': shop_id,
        'nonce': int(time.time())
    }
    response = send_request('balance', data, api_key)
    return response


def create_order(payment_id, payment_system_id, email, amount, currency, ip, api_key=settings.FK_API_KEY,
                 shop_id=settings.FK_MERCHANT_ID):
    data = {
        'shopId': shop_id,
        'nonce': timezone.now().timestamp(),
        'paymentId': payment_id,
        'i': payment_system_id,
        'email': email,
        'amount': amount,
        'currency': currency,
        'ip': ip
    }
    response = send_request('orders/create', data, api_key)
    return response


def get_order_status(shop_id, order_id, api_key=settings.FK_API_KEY):
    data = {
        'shopId': shop_id,
        'nonce': int(time.time()),
        'orderId': order_id
    }
    response = send_request('orders', data, api_key)
    return response

# import hashlib
# import time
# import requests
#
#
# class Freekassa:
#     def __init__(self):
#         self._payUrl = 'https://pay.freekassa.ru'
#         self._apiUrl = 'https://api.freekassa.ru/v1'
#         self._lang = 'ru'
#         self._currency = 'RUB'
#         self._key = 'bbf90e6184c1c61361dde7121a602f7f'
#         self._secret1 = 'u}1cE$wll9*Q.UF'
#         self._secret2 = '!v5KTR@T8&8z1rX'
#         self._shopId = '36606'
#         self._paymentId = int(time.time())
#         self._orderId = int(time.time())+1
#         self._orderStatus = None
#         self._amount = 122
#         self._i = 1
#         self._tel = None
#         self._email = 'ivanhvalevskey@gmail.com'
#         self._ip = None
#         self._account = None
#         self._dateFrom = None
#         self._dateTo = None
#         self._page = None
#         self._success_url = None
#         self._failure_url = None
#         self._notification_url = None
#         self._signatureForm = None
#
#     def _signature(self, data):
#         sorted_values = sorted(data.values())
#         joined_values = '|'.join(sorted_values)
#         key_bytes = bytes(self._key, 'utf-8')
#         hmac = hashlib.sha256(key_bytes)
#         hmac.update(joined_values.encode('utf-8'))
#         return hmac.hexdigest()
#
#     def _request(self, requestMethod, requestEndPoint, requestBody):
#         requestBody['nonce'] = str(int(time.time() * 1000))
#         requestBody['signature'] = self._signature(requestBody)
#         response = requests.request(requestMethod, requestEndPoint, json=requestBody)
#         return response.json()
#
#     def sign(self):
#         signature_str = f'{self._shopId}:{self._amount}:{self._secret1}:{self._currency}:{self._paymentId}'
#         self._signatureForm = hashlib.md5(signature_str.encode('utf-8')).hexdigest()
#
#     def create(self):
#         if not all([self._amount, self._currency, self._paymentId, self._signatureForm, self._shopId]):
#             return False
#
#         request_params = [
#             f'm={self._shopId}',
#             f'oa={self._amount}',
#             f'currency={self._currency}',
#             f'o={self._paymentId}',
#             f's={self._signatureForm}'
#         ]
#
#         if self._i:
#             request_params.append(f'i={self._i}')
#         if self._tel:
#             request_params.append(f'phone={self._tel}')
#         if self._email:
#             request_params.append(f'em={self._email}')
#         if self._lang:
#             request_params.append(f'lang={self._lang}')
#
#         return f'{self._payUrl}/?{"&".join(request_params)}'
#
#     def orders(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         if self._paymentId:
#             requestBody['paymentId'] = str(self._paymentId)
#         if self._orderId:
#             requestBody['orderId'] = int(self._orderId)
#         if self._orderStatus:
#             requestBody['orderStatus'] = int(self._orderStatus)
#         if self._dateFrom:
#             requestBody['dateFrom'] = str(self._dateFrom)
#         if self._dateTo:
#             requestBody['dateTo'] = str(self._dateTo)
#         if self._page:
#             requestBody['page'] = int(self._page)
#
#         return self._request('POST', f'{self._apiUrl}/orders', requestBody)
#
#     def ordersCreate(self):
#         if not all([self._i, self._email, self._ip, self._amount, self._currency, self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId),
#             'i': int(self._i),
#             'email': str(self._email),
#             'ip': str(self._ip),
#             'amount': float(self._amount),
#             'currency': str(self._currency)
#         }
#
#         if self._paymentId:
#             requestBody['paymentId'] = str(self._paymentId)
#         if self._tel:
#             requestBody['tel'] = str(self._tel)
#         if self._success_url:
#             requestBody['success_url'] = str(self._success_url)
#         if self._failure_url:
#             requestBody['failure_url'] = str(self._failure_url)
#         if self._notification_url:
#             requestBody['notification_url'] = str(self._notification_url)
#
#         return self._request('POST', f'{self._apiUrl}/orders/create', requestBody)
#
#     def withdrawals(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         if self._orderId:
#             requestBody['orderId'] = int(self._orderId)
#         if self._paymentId:
#             requestBody['paymentId'] = str(self._paymentId)
#         if self._orderStatus:
#             requestBody['orderStatus'] = int(self._orderStatus)
#         if self._dateFrom:
#             requestBody['dateFrom'] = str(self._dateFrom)
#         if self._dateTo:
#             requestBody['dateTo'] = str(self._dateTo)
#         if self._page:
#             requestBody['page'] = int(self._page)
#
#         return self._request('POST', f'{self._apiUrl}/withdrawals', requestBody)
#
#     def withdrawalsCreate(self):
#         if not all([self._i, self._account, self._amount, self._currency, self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId),
#             'i': int(self._i),
#             'account': str(self._account),
#             'amount': float(self._amount),
#             'currency': str(self._currency)
#         }
#
#         if self._paymentId:
#             requestBody['paymentId'] = str(self._paymentId)
#
#         return self._request('POST', f'{self._apiUrl}/withdrawals/create', requestBody)
#
#     def balance(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         return self._request('POST', f'{self._apiUrl}/balance', requestBody)
#
#     def currencies(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         return self._request('POST', f'{self._apiUrl}/currencies', requestBody)
#
#     def currenciesStatus(self):
#         if not all([self._key, self._shopId, self._i]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         return self._request('POST', f'{self._apiUrl}/currencies/{self._i}/status', requestBody)
#
#     def withdrawalsCurrencies(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         return self._request(f'POST/{self._apiUrl}/withdrawals/currencies', requestBody)
#
#     def shops(self):
#         if not all([self._key, self._shopId]):
#             return False
#
#         requestBody = {
#             'shopId': int(self._shopId)
#         }
#
#         return self._request('POST', f'{self._apiUrl}/shops', requestBody)
#
# fk = Freekassa()
# print(fk.create())
