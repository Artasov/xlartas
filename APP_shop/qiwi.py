import os
from datetime import datetime, timedelta

import requests


def create_bill(value: int, billid: str, comment: str = '',
                expired_minutes: int = 10, customer: dict = None,
                currency: str = 'RUB', custom_fields: dict = None,
                SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY'), ):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    now = datetime.utcnow()
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
    g = requests.put(f'https://api.qiwi.com/partner/bill/v1/bills/{billid}',
                     headers=headers, json=params)
    return g.json()


def check_bill(billid: str, SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    headers = {'Authorization': f'Bearer {SECRET_KEY}',
               'Accept': 'application/json'}
    g = requests.get(f'https://api.qiwi.com/partner/bill/v1/bills/{billid}',
                     headers=headers)
    return g.json()


def reject_bill(billid: str, SECRET_KEY: str = os.getenv('QIWI_SECRET_KEY')):
    """
    Read about the parameters in the QiwiApi Docs: 16 01 2023.
    Specify SECRET_KEY in the environment variable named QIWI_SECRET_KEY.
    Returns the json-encoded content of a response, if any.
    """
    headers = {'Authorization': f'Bearer {SECRET_KEY}',
               'Accept': 'application/json',
               'Content-Type': 'application/json'}
    g = requests.post(f'https://api.qiwi.com/partner/bill/v1/bills/{billid}/reject',
                      headers=headers)
    return g.json()
