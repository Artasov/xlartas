# tbank/classes/TBank.py
import hashlib
import json
import logging
from collections import OrderedDict
from enum import Enum
from json import JSONEncoder
from typing import Type
from typing import TypedDict, Literal, Optional, Union

import aiohttp
import uuid6
from django.conf import settings
from phonenumbers import PhoneNumber

SUCCESS_FAILURE_GET_PARAMS_TEMPLATE = '?Success=${Success}&ErrorCode=${ErrorCode}&Message=${Message}&Details=${Details}&Amount=${Amount}&MerchantEmail=${MerchantEmail}&MerchantName=${MerchantName}&OrderId=${OrderId}&PaymentId=${PaymentId}&TranDate=${TranDate}&BackUrl=${BackUrl}&CompanyName=${CompanyName}&EmailReq=${EmailReq}&PhonesReq=${PhonesReq}'

PaymentMethod = Literal[
    'full_prepayment',  # предоплата 100%
    'prepayment',  # предоплата
    'advance',  # аванс
    'full_payment',  # полный расчет
    'partial_payment',  # частичный расчет и кредит
    'credit',  # передача в кредит
    'credit_payment'  # оплата кредита
]

PaymentObject = Literal[
    'commodity',  # товар
    'excise',  # подакцизный товар
    'job',  # работа
    'service',  # услуга
    'gambling_bet',  # ставка азартной игры
    'gambling_prize',  # выигрыш азартной игры
    'lottery',  # лотерейный билет
    'lottery_prize',  # выигрыш лотереи
    'intellectual_activity',  # предоставление результатов интеллектуальной деятельности
    'payment',  # платеж
    'agent_commission',  # агентское вознаграждение
    'composite',  # составной предмет расчета
    'another'  # иной предмет расчета
]


class AgentData(TypedDict, total=False):
    AgentSign: str | None
    OperationName: str | None
    Phones: list[str] | None
    ReceiverPhones: list[str] | None
    TransferPhones: list[str] | None
    OperatorName: str | None
    OperatorAddress: str | None
    OperatorInn: str | None


class SupplierInfo(TypedDict, total=False):
    Phones: list[str]
    Name: str
    Inn: str


class ItemFFD105(TypedDict, total=False):
    Name: str
    Price: int
    Quantity: Union[int, float]
    Amount: Union[int, float]
    PaymentMethod: PaymentMethod | None
    PaymentObject: PaymentObject | None
    Tax: Literal["none", "vat0", "vat10", "vat20", "vat110", "vat120"]
    AgentData: AgentData | None
    SupplierInfo: SupplierInfo | None
    Ean13: str | None
    ShopCode: str | None


class Payments(TypedDict, total=False):
    Cash: Union[int, float] | None
    Electronic: Union[int, float]
    AdvancePayment: Union[int, float] | None
    Credit: Union[int, float] | None
    Provision: Union[int, float] | None


class Shops(TypedDict):
    ShopCode: str
    Amount: Union[int, float]
    Name: str | None
    Fee: Union[int, float] | None
    Descriptor: str | None


class ReceiptFFD105(TypedDict, total=False):
    Items: list[ItemFFD105]
    FfdVersion: str | None
    Email: str | None
    Phone: str | None
    Taxation: Literal[
        "osn", "usn_income", "usn_income_outcome", "envd", "esn", "patent"
    ]
    Payments: Payments | None
    Shops: list[Shops] | None


class ReceiptFFD12(ReceiptFFD105):
    pass  # Можно дополнить новыми полями, если они есть для версии 1.2


class Receipt(TypedDict):
    Receipt_FFD_105: ReceiptFFD105 | None
    Receipt_FFD_12: ReceiptFFD12 | None


class InitRequest(TypedDict):
    TerminalKey: str
    Amount: int
    OrderId: str
    Description: str | None
    DATA: dict[str, str] | None
    Receipt: ReceiptFFD105 | ReceiptFFD12 | None
    PayType: str | None
    Recurrent: str | None
    CustomerKey: str | None
    RedirectDueDate: str | None
    NotificationURL: str | None
    SuccessURL: str | None
    FailURL: str | None
    Language: str | None
    Token: str


class InitResponse(TypedDict):
    Success: bool
    ErrorCode: str
    TerminalKey: str
    Status: str
    PaymentId: str
    OrderId: str
    Amount: int
    PaymentURL: str | None


class OperationInitiatorType(Enum):
    CIT_CNC = "0"
    CIT_CC = "1"
    CIT_COF = "2"
    CIT_COF_R = "R"
    CIT_COF_I = "I"


class DeviceOs(Enum):
    iOS = 'iOS'
    Android = 'Android'
    macOS = 'macOS'
    Windows = 'Windows'
    Linux = 'Linux'


class DeviceBrowser(Enum):
    Chrome = 'Chrome'
    Firefox = 'Firefox'
    JivoMobile = 'JivoMobile'
    MicrosoftEdge = 'MicrosoftEdge'
    Edge = 'Edge'
    Miui = 'Miui'
    Opera = 'Opera'
    Safari = 'Safari'
    Samsung = 'Samsung'
    WebKit = 'WebKit'
    WeChat = 'WeChat'
    Yandex = 'Yandex'


class Device(Enum):
    Desktop = 'Desktop'
    Mobile = 'Mobile'
    SDK = 'SDK'


class TBankBaseDATA(TypedDict):
    Phone: str
    Email: str
    Source: str
    # bankName
    ...
    # https://www.tbank.ru/kassa/dev/payments/#section/Peredacha-priznaka-iniciatora-operacii


class TBankSBPDATA(TBankBaseDATA):
    QR: bool


class TBankPayDATA(TBankBaseDATA):
    TinkoffPayWeb: bool
    Device: Device
    DeviceOs: DeviceOs
    DeviceWebView: bool
    DeviceBrowser: DeviceBrowser


class TBankNotification(TypedDict):
    TerminalKey: str
    OrderId: str
    Success: bool
    Status: str
    PaymentId: int
    ErrorCode: str
    Amount: int
    CardId: int
    Pan: str
    ExpDate: str
    Token: str
    DATA: TBankBaseDATA


def replace_none_with_string(data):
    if isinstance(data, dict):
        return {k: replace_none_with_string(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_none_with_string(v) for v in data]
    elif data is None:
        return "None"
    else:
        return data


def remove_none_values(data, exclude_keys=None):
    if exclude_keys is None:
        exclude_keys = []

    if isinstance(data, dict):
        return {k: remove_none_values(v, exclude_keys) for k, v in data.items() if v is not None or k in exclude_keys}
    elif isinstance(data, list):
        return [remove_none_values(item, exclude_keys) for item in data]
    else:
        return data


log = logging.getLogger('tbank')


class CustomTBankJsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid6.UUID):
            return str(obj)
        elif isinstance(obj, PhoneNumber):
            return str(obj)
        return super().default(obj)


class TBank:
    def __init__(self,
                 terminal_key: str = None,
                 password: str = None):
        self.terminal_key = settings.TBANK_TERMINAL_KEY if not terminal_key else terminal_key
        self.password = settings.TBANK_PASSWORD if not password else password
        # self.base_url = "https://rest-api-test.tinkoff.ru/v2/"
        self.base_url = "https://securepay.tinkoff.ru/v2/"

    async def _post(self, endpoint: str, data: dict) -> dict:
        data = replace_none_with_string(data)  # Заменяем все None на "None"
        async with aiohttp.ClientSession() as session:
            serialized_data = json.dumps(data, cls=CustomTBankJsonEncoder)
            headers = {'Content-Type': 'application/json'}
            log.info(f'POST {self.base_url + endpoint}')
            log.info(serialized_data)
            async with session.post(self.base_url + endpoint, data=serialized_data, headers=headers) as response:
                log.info(f'POST RESPONSE {self.base_url + endpoint}')
                response_json = await response.json()
                response_text = await response.text()
                response_status_code = response.status
                log.info(f'{response_json=}')
                log.info(f'{response_text=}')
                log.info(f'{response_status_code=}')
                return response_json

    @staticmethod
    def _generate_token(notification: dict) -> str:
        params = {k: v for k, v in notification.items() if k not in
                  ('Shops', 'DATA', 'Receipt', 'Token')}
        for key in params.keys():
            if params[key] is None:
                params[key] = 'None'
            if params[key] == 'True':
                params[key] = 'true'
            elif params[key] == 'False':
                params[key] = 'false'
            elif isinstance(params[key], bool):
                params[key] = 'true' if params[key] else 'false'
        params['Password'] = settings.TBANK_PASSWORD
        sorted_parameters = OrderedDict(sorted(params.items()))
        concatenated_values = ''.join(str(sorted_parameters[key]) for key in sorted_parameters)
        return hashlib.sha256(concatenated_values.encode('utf-8')).hexdigest()

    def is_token_valid(self, response: dict) -> bool:
        token = str(response.get('Token'))
        expected_token = self._generate_token(response)
        provided_token = token
        return expected_token == provided_token

    async def Init(
            self,
            amount: int,
            order_id: str,
            description: str = None,
            data: dict = None,
            receipt: ReceiptFFD105 | ReceiptFFD12 = None,
            pay_type: str = None,
            recurrent: str = None,
            customer_key: str = None,
            redirect_due_date: str = None,
            notification_url: str = None,
            success_url: str = None,
            fail_url: str = None,
            language: str = None,
            operation_initiator_type: OperationInitiatorType = None
    ) -> InitResponse:
        """
        Инициализация платежной сессии.
        @param amount: Сумма платежа в копейках.
        @param order_id: Номер заказа.
        @param description: Описание заказа.
        @param data: Дополнительные данные.
        @param receipt: Данные чека.
        @param pay_type: Тип платежа.
        @param recurrent: Признак рекуррентного платежа.
        @param customer_key: Ключ клиента.
        @param redirect_due_date: Дата окончания жизни ссылки на платежную форму.
        @param notification_url: URL для получения нотификаций.
        @param success_url: URL для перенаправления в случае успешного платежа.
        @param fail_url: URL для перенаправления в случае неудачного платежа.
        @param language: Язык интерфейса платежной формы.
        @param operation_initiator_type: Тип инициатора операции.
        @return: Возвращает объект InitResponse с результатом инициализации платежа.
        """
        init_data: InitRequest = {
            'TerminalKey': self.terminal_key,
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
            'Token': ''
        }
        if operation_initiator_type is not None:
            init_data['DATA'] = init_data.get('DATA', {})
            init_data['DATA']['OperationInitiatorType'] = operation_initiator_type.value
        init_data = remove_none_values(init_data, exclude_keys=None)
        init_data['Token'] = self._generate_token(init_data)
        return await self._post('Init', init_data)

    async def AddCustomer(
            self,
            customer_key: str,
            ip: str | None = None,
            email: str | None = None,
            phone: str | None = None
    ) -> dict:
        """
        Регистрация клиента.
        @param customer_key: Идентификатор клиента в системе Мерчанта.
        @param ip: IP-адрес запроса.
        @param email: Email клиента.
        @param phone: Телефон клиента в формате +{Ц}.
        @return: Возвращает результат регистрации клиента.
        """
        if email:
            data = {
                'TerminalKey': self.terminal_key,
                'CustomerKey': customer_key,
                'IP': ip,
                'Email': email,
                'Phone': phone,
            }
        else:
            data = {
                'TerminalKey': self.terminal_key,
                'CustomerKey': customer_key,
                'IP': ip,
                'Phone': phone,
            }

        data['Token'] = self._generate_token(data)
        return await self._post('AddCustomer', data)

    async def GetState(self, payment_id: int) -> dict:
        """
        Получение статуса платежа.
        @param payment_id: Идентификатор платежа.
        @return: Возвращает статус платежа.
        """
        data = {
            'TerminalKey': self.terminal_key,
            'PaymentId': payment_id,
            'Token': ''
        }
        data['Token'] = self._generate_token(data)
        return await self._post('GetState', data)

    async def Cancel(self, payment_id: str, amount: Optional[int] = None) -> dict:
        """
        Отмена платежа.
        @param payment_id: Идентификатор платежа.
        @param amount: Сумма отмены (если частичная).
        @return: Возвращает результат отмены платежа.
        """
        data = {
            'TerminalKey': self.terminal_key,
            'PaymentId': payment_id,
            'Amount': amount,
            'Token': ''
        }
        data['Token'] = self._generate_token(data)
        return await self._post('Cancel', data)

    async def Charge(self, payment_id: Type[int], rebill_id: Type[int]) -> dict:
        """
        Проведение рекуррентного платежа.
        @param payment_id: Идентификатор платежа.
        @param rebill_id: Идентификатор рекуррентного платежа.
        @return: Возвращает результат проведения рекуррентного платежа.
        """
        data = {
            'TerminalKey': self.terminal_key,
            'PaymentId': payment_id,
            'RebillId': rebill_id,
            'Token': ''
        }
        data['Token'] = self._generate_token(data)
        return await self._post('Charge', data)

    async def Resend(self) -> dict:
        """
        Перезапрос неотправленных нотификаций.
        @return: Возвращает результат перезапроса нотификаций.
        """
        data = {
            'TerminalKey': self.terminal_key,
            'Token': ''
        }
        data['Token'] = self._generate_token(data)
        return await self._post('Resend', data)
