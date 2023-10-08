import logging
import os
import secrets
import urllib.parse
from datetime import datetime, timedelta

import requests
from django.core.exceptions import BadRequest
from django.utils import timezone

from APP_shop.models import Order, Promo


def create_order(value: int, order_id: str, comment: str = '',
                 expired_minutes: int = 10, customer: dict = None,
                 currency: str = 'RUB', custom_fields: dict = None,
                 SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY'), ):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    now = timezone.now()
    ex_date = now + timedelta(minutes=expired_minutes)

    headers = {'Authorization': f'Bearer {SECRET_KEY}',
               'Accept': 'application/json',
               'Content-Type': 'application/json'}

    params = {'amount': {'value': value,
                         'currency': currency},
              'comment': comment,
              'expirationDateTime': f'{ex_date.strftime("%Y-%m-%dT%H:%MZ")}',
              'customer': customer,
              'customFields': custom_fields}
    g = requests.put(f'https://api.qiwi.com/partner/bill/v1/bills/{order_id}',
                     headers=headers, json=params)
    return g.json()


def create_payment_and_order(user_id: int,
                             order_type: Order.OrderType,
                             amount: int, amount_with_promo: int,
                             promo_id: int,
                             comment: str = '',
                             product_id: int = '',
                             license_type: str = '',
                             expired_minutes: int = 10, customer: dict = None,
                             currency: str = 'RUB', custom_fields: dict = None,
                             SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY'), ) -> Order:
    order_id = secrets.token_hex(15)

    qiwi_order = create_order(amount_with_promo, order_id, comment,
                              expired_minutes, customer,
                              currency, custom_fields,
                              SECRET_KEY)
    if 'payUrl' not in qiwi_order:
        raise BadRequest
    order_ = Order.objects.create(user_id=user_id,
                                  amountRub=amount,
                                  promo_id=promo_id,
                                  product_id=product_id,
                                  license_type=license_type,
                                  order_system_name='QIWI',
                                  order_id=order_id,
                                  type=order_type,
                                  pay_link=qiwi_order['payUrl'], )
    return order_


def check_order(order_id: str, SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    headers = {'Authorization': f'Bearer {SECRET_KEY}',
               'Accept': 'application/json'}
    g = requests.get(f'https://api.qiwi.com/partner/bill/v1/bills/{order_id}',
                     headers=headers)
    return g.json()


def reject_order(order_id: str, SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    headers = {'Authorization': f'Bearer {SECRET_KEY}',
               'Accept': 'application/json',
               'Content-Type': 'application/json'}
    g = requests.post(f'https://api.qiwi.com/partner/bill/v1/bills/{order_id}/reject',
                      headers=headers)
    return g.json()


def register_webhook(hook_type: int, param: str, txn_type: str,
                     SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    base_url = "https://api.qiwi.com/payment-notifier/v1/hooks"
    param_encoded = urllib.parse.quote(param)  # Кодируем параметр для URL
    full_url = f"{base_url}?hookType={hook_type}&param={param_encoded}&txnType={txn_type}"

    headers = {
        "Authorization": f"Bearer {SECRET_KEY}",
        "Accept": "application/json"
    }

    try:
        response = requests.put(full_url, headers=headers)
        response_json = response.json()

        if response.status_code == 200:
            return {
                "hookId": response_json.get("hookId"),
                "hookParameters": response_json.get("hookParameters"),
                "hookType": response_json.get("hookType"),
                "txnType": response_json.get("txnType")
            }
        else:
            logging.error(f"Error: {response.status_code}, {response_json}")
            return None

    except requests.exceptions.RequestException as e:
        logging.error(f"Error: {e}")
        return None


def get_webhook_key(hook_id, SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Get the webhook key for the specified hook_id.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the JSON-encoded content of a response, if any.
    """
    url = f"https://api.qiwi.com/payment-notifier/v1/hooks/{hook_id}/key"

    headers = {
        "Authorization": f"Bearer {SECRET_KEY}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response_json = response.json()

        if response.status_code == 200:
            return response_json.get("key")
        else:
            logging.error(f"Error: {response.status_code}, {response_json}")
            return None

    except requests.exceptions.RequestException as e:
        logging.error(f"Error: {e}")
        return None
