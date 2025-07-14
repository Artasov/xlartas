# tbank/classes/TBank.py
"""Client for working with Tinkoff bank API."""
from __future__ import annotations

import logging
from typing import Optional, Type

from django.conf import settings

from apps.tbank.types import (
    InitRequest,
    InitResponse,
    OperationInitiatorType,
    ReceiptFFD105,
    ReceiptFFD12,
)
from apps.tbank.utils import remove_none_values, request, generate_token

SUCCESS_FAILURE_GET_PARAMS_TEMPLATE = (
    '?Success=${Success}&ErrorCode=${ErrorCode}&Message=${Message}&Details=${Details}'
    '&Amount=${Amount}&MerchantEmail=${MerchantEmail}&MerchantName=${MerchantName}'
    '&OrderId=${OrderId}&PaymentId=${PaymentId}&TranDate=${TranDate}&BackUrl=${BackUrl}'
    '&CompanyName=${CompanyName}&EmailReq=${EmailReq}&PhonesReq=${PhonesReq}'
)

log = logging.getLogger('tbank')


class TBank:
    """Thin wrapper over the REST API."""

    def __init__(self, terminal_key: str | None = None, password: str | None = None) -> None:
        self.terminal_key = terminal_key or settings.TBANK_TERMINAL_KEY
        self.password = password or settings.TBANK_PASSWORD
        self.base_url = 'https://securepay.tinkoff.ru/v2/'

    def is_token_valid(self, response: dict) -> bool:
        token = str(response.get('Token'))
        expected_token = generate_token(response)
        return expected_token == token

    async def Init(
            self,
            amount: int,
            order_id: str,
            description: Optional[str] = None,
            data: dict | None = None,
            receipt: ReceiptFFD105 | ReceiptFFD12 | None = None,
            pay_type: Optional[str] = None,
            recurrent: Optional[str] = None,
            customer_key: Optional[str] = None,
            redirect_due_date: Optional[str] = None,
            notification_url: Optional[str] = None,
            success_url: Optional[str] = None,
            fail_url: Optional[str] = None,
            language: Optional[str] = None,
            operation_initiator_type: OperationInitiatorType | None = None,
    ) -> InitResponse:
        """Initialize a payment session."""
        init_data: InitRequest = {
            'Amount': amount,
            'OrderId': order_id,
            'Description': description,
            'DATA': data,
            'Receipt': receipt,
            'PayType': pay_type,
            'Recurrent': recurrent,
            'CustomerKey': customer_key,
            'RedirectDueDate': redirect_due_date,
            'NotificationURL': notification_url,
            'SuccessURL': success_url,
            'FailURL': fail_url,
            'Language': language,
            'Token': '',
        }
        if operation_initiator_type is not None:
            init_data['DATA'] = init_data.get('DATA', {})
            init_data['DATA']['OperationInitiatorType'] = operation_initiator_type.value
        init_data = remove_none_values(init_data)
        return await request(self.base_url, self.terminal_key, 'Init', init_data)

    async def AddCustomer(
            self,
            customer_key: str,
            ip: str | None = None,
            email: str | None = None,
            phone: str | None = None,
    ) -> dict:
        """Register a new customer."""
        if email:
            data = {
                'CustomerKey': customer_key,
                'IP': ip,
                'Email': email,
                'Phone': phone,
            }
        else:
            data = {
                'CustomerKey': customer_key,
                'IP': ip,
                'Phone': phone,
            }
        return await request(self.base_url, self.terminal_key, 'AddCustomer', data)

    async def GetState(self, payment_id: int) -> dict:
        """Get current payment state."""
        data = {'PaymentId': payment_id}
        return await request(self.base_url, self.terminal_key, 'GetState', data)

    async def Cancel(self, payment_id: str, amount: Optional[int] = None) -> dict:
        """Cancel a payment."""
        data = {'PaymentId': payment_id, 'Amount': amount}
        return await request(self.base_url, self.terminal_key, 'Cancel', data)

    async def Charge(self, payment_id: Type[int], rebill_id: Type[int]) -> dict:
        """Perform a recurrent charge."""
        data = {'PaymentId': payment_id, 'RebillId': rebill_id}
        return await request(self.base_url, self.terminal_key, 'Charge', data)

    async def Resend(self) -> dict:
        """Resend failed notifications."""
        return await request(self.base_url, self.terminal_key, 'Resend', {})
