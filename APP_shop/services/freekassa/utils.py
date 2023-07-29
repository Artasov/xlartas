import hmac
import time

import requests
import hashlib
import json

from django.conf import settings


PaymentSystems = {
    'FK_RUB': (1, "RUB"),
    'FK_USD': (2, "USD"),
    'FK_EUR': (3, "EUR"),
    'USD': (4, "USD"),
    'EUR': (5, "EUR"),
    'VISA_RUB': (6, "RUB"),
    'UAH': (7, "UAH"),
    'MASTER_CARD_RUB': (8, "RUB"),
    'VISA_MASTER_CARD_UAH': (9, "UAH"),
    'QIWI': (10, "RUB"),
    'ONLINE_BANK': (13, "Онлайн банк"),
    'USDT_ERC20': (14, "USDT"),
    'USDT_TRC20': (15, "USDT"),
    'BITCOIN_CASH': (16, "BCH"),
    'BNB': (17, "BNB"),
    'DASH': (18, "DASH"),
    'DOGECOIN': (19, "Dogecoin"),
    'ZEC': (20, "ZEC"),
    'XMR': (21, "XMR"),
    'WAVES': (22, "Waves"),
    'XRP': (23, "XRP"),
    'BITCOIN': (24, "BTC"),
    'LTC': (25, "LTC"),
    'ETH': (26, "ETH"),
    'MEGAFON': (28, "Мегафон"),
    'VISA_USD': (32, "VISA USD"),
    'PERFECT_MONEY_USD': (33, "Perfect Money USD"),
    'SHIBA_INU': (34, "Shiba Inu"),
    'QIWI_API': (35, "QIWI API"),
    'CARD_RUB_API': (36, "Card RUB API"),
    'GOOGLE_PAY': (37, "Google Pay"),
    'APPLE_PAY': (38, "Apple Pay"),
    'TRX': (39, "TRX"),
    'WEBMONEY_WMZ': (40, "Webmoney WMZ"),
    'VISA_MASTER_CARD_KZT': (41, "VISA / MasterCard KZT"),
    'SBP': (42, "RUB")
}


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
        'nonce': int(time.time()),
        'paymentId': payment_id,
        'i': int(payment_system_id),
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
