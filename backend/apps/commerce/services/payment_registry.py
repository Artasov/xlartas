# commerce/services/payment_registry.py
"""
Реестр доступных платёжных систем и поддерживаемых валют.

●Опирается на настройки settings, но допускает динамическое расширение
  (например, из БД или конфига).
●SRP+Open/Closed — добавление нового провайдера не требует
  правок существующего кода.
"""

from __future__ import annotations

import importlib
import logging
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Type, TYPE_CHECKING

from django.conf import settings

from apps.commerce.models.payment import PaymentSystem

log = logging.getLogger('payment_registry')

if TYPE_CHECKING:
    from apps.commerce.providers.base import BasePaymentProvider


@dataclass(slots=True)
class PaymentProviderInfo:
    system: PaymentSystem
    provider_path: str
    currencies: tuple[str, ...]

    # Lazy‑load провайдер
    def load_provider_cls(self):
        module_name, attr = self.provider_path.rsplit('.', 1)
        module = importlib.import_module(module_name)
        return getattr(module, attr)


class PaymentSystemRegistry:
    _registry: Dict[str, PaymentProviderInfo] = {}
    _currency_map: Dict[str, List[str]] = defaultdict(list)

    @classmethod
    def register(cls, info: PaymentProviderInfo) -> None:
        cls._registry[info.system] = info
        for cur in info.currencies:
            cls._currency_map[cur].append(info.system)
        if settings.MAIN_PROCESS: log.info('[PaymentRegistry] Registered %s', info.system)

    @classmethod
    def provider_cls(cls, system: str) -> Type['BasePaymentProvider']:
        if system not in cls._registry:
            raise ValueError(f'Payment system {system} not registered')
        return cls._registry[system].load_provider_cls()

    @classmethod
    def available_systems(cls, currency: str) -> List[str]:
        return cls._currency_map.get(currency, [])


# ---------------------------------------------------------------------- #
#  РЕГИСТРАЦИЯ   (ready() AppConfig)
# ---------------------------------------------------------------------- #
def _bootstrap_registry():
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.TBank,
        provider_path='apps.tbank.providers.TBankPaymentProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.CloudPayment,
        provider_path='apps.cloudpayments.providers.CloudPaymentsProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.TBankInstallment,
        provider_path='apps.tbank.providers.TBankInstallmentProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.HandMade,
        provider_path='apps.commerce.providers.handmade.HandMadeProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.FreeKassa,
        provider_path='apps.freekassa.providers.FreeKassaProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.CKassa,
        provider_path='apps.ckassa.providers.CKassaProvider',
        currencies=('RUB',),
    ))
    PaymentSystemRegistry.register(PaymentProviderInfo(
        system=PaymentSystem.Balance,
        provider_path='apps.commerce.providers.balance.BalanceProvider',
        currencies=('RUB',),
    ))
