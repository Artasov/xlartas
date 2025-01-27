# tbank/managers/customer.py
import logging
from uuid import uuid4

from django.db.models import Manager

from apps.tbank.classes.TBank import TBank

log = logging.getLogger('tbank')


class FailedToCreateTBankCustomer(Exception):
    pass


class TBankCustomerManager(Manager):
    @staticmethod
    async def get_or_init(
            user_id: int = None,
            customer_key: str = None,
            ip: str = None,
            email: str = None,
            phone: str = None
    ):
        from apps.tbank.models import TBankCustomer
        try:
            if user_id:
                return await TBankCustomer.objects.aget(user_id=user_id)
            if customer_key:
                return await TBankCustomer.objects.aget(key=customer_key)
        except TBankCustomer.DoesNotExist:
            tbank = TBank()
            customer_key = str(uuid4())
            if email:
                response = await tbank.AddCustomer(
                    customer_key=customer_key,
                    ip=ip,
                    email=email,
                    phone=phone,
                )
            else:
                response = await tbank.AddCustomer(
                    customer_key=customer_key,
                    ip=ip,
                    phone=phone,
                )
            if response.get('Success'):
                return await TBankCustomer.objects.acreate(
                    user_id=user_id,
                    key=response.get('CustomerKey'),
                )
            else:
                log.critical(f'AddCustomer response not successful. {response}')
                raise FailedToCreateTBankCustomer()
