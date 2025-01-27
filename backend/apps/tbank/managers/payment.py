# tbank/managers/payment.py
import logging

from django.conf import settings
from django.db.models import Manager

from apps.tbank.classes.TBank import TBank, OperationInitiatorType, ReceiptFFD12, ReceiptFFD105
from apps.tbank.exceptions.base import TBankException

log = logging.getLogger('tbank')


class TBankPaymentManager(Manager):
    from apps.tbank.models import TBankPayment

    @staticmethod
    async def init(
            user: settings.AUTH_USER_MODEL,
            ip: str,
            amount: int,
            order_id,
            description: str = None,
            data: dict = None,
            receipt: ReceiptFFD105 | ReceiptFFD12 = None,
            pay_type: str = None,
            recurrent: str = None,
            redirect_due_date: str = None,
            notification_url: str = None,
            success_url: str = None,
            fail_url: str = None,
            language: str = None,
            operation_initiator_type: OperationInitiatorType = None
    ) -> TBankPayment | None:
        from apps.tbank.models import TBankPayment, TBankCustomer
        from apps.commerce.models import Currency
        tbank = TBank()
        if user.email:
            customer: TBankCustomer | None = await TBankCustomer.objects.get_or_init(
                user_id=user.id,
                email=user.email,
                ip=ip,
                phone=user.phone
            )
        else:
            customer: TBankCustomer | None = await TBankCustomer.objects.get_or_init(
                user_id=user.id,
                ip=ip,
                phone=user.phone
            )
        response = await tbank.Init(
            amount=amount,
            order_id=order_id,
            description=description,
            data=data,
            receipt=receipt,
            pay_type=pay_type,
            recurrent=recurrent,
            customer_key=customer.key,
            redirect_due_date=redirect_due_date,
            notification_url=notification_url,
            success_url=success_url,
            fail_url=fail_url,
            language=language,
            operation_initiator_type=operation_initiator_type,
        )
        if response.get('Success'):
            return await TBankPayment.objects.acreate(
                user=user,
                id=response['PaymentId'],
                customer=customer,
                order_id=response['OrderId'],
                amount=response['Amount'] / 100,
                currency=Currency.RUB,
                status=response['Status'],
                payment_url=response['PaymentURL'],
            )
        else:
            raise TBankException.Payment.FailedToInitialize()
