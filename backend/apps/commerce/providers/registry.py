# commerce/providers/registry.py
from typing import Type, Dict

from apps.cloudpayments.providers import CloudPaymentsProvider
from apps.commerce.providers.base import BasePaymentProvider
from apps.commerce.providers.handmade import HandMadeProvider
from apps.tbank.providers import TBankPaymentProvider

_REGISTRY: Dict[str, Type[BasePaymentProvider]] = {
    p.system_name: p
    for p in (
        TBankPaymentProvider,
        CloudPaymentsProvider,
        HandMadeProvider,
    )
}


def get_provider(system_name: str) -> Type[BasePaymentProvider]:
    try:
        return _REGISTRY[system_name]
    except KeyError:
        raise ValueError(f'Unknown payment system “{system_name}”')
