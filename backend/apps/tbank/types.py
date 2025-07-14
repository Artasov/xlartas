# apps/tbank/types.py
"""Typed structures and enums used by the TBank client."""
from enum import Enum
from typing import Literal, Optional, TypedDict


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
    AgentSign: Optional[str]
    OperationName: Optional[str]
    Phones: list[str] | None
    ReceiverPhones: list[str] | None
    TransferPhones: list[str] | None
    OperatorName: Optional[str]
    OperatorAddress: Optional[str]
    OperatorInn: Optional[str]


class SupplierInfo(TypedDict, total=False):
    Phones: list[str]
    Name: str
    Inn: str


class ItemFFD105(TypedDict, total=False):
    Name: str
    Price: int
    Quantity: int | float
    Amount: int | float
    PaymentMethod: PaymentMethod | None
    PaymentObject: PaymentObject | None
    Tax: Literal['none', 'vat0', 'vat10', 'vat20', 'vat110', 'vat120']
    AgentData: AgentData | None
    SupplierInfo: SupplierInfo | None
    Ean13: Optional[str]
    ShopCode: Optional[str]


class Payments(TypedDict, total=False):
    Cash: int | float | None
    Electronic: int | float
    AdvancePayment: int | float | None
    Credit: int | float | None
    Provision: int | float | None


class Shops(TypedDict):
    ShopCode: str
    Amount: int | float
    Name: Optional[str]
    Fee: int | float | None
    Descriptor: Optional[str]


class ReceiptFFD105(TypedDict, total=False):
    Items: list[ItemFFD105]
    FfdVersion: Optional[str]
    Email: Optional[str]
    Phone: Optional[str]
    Taxation: Literal[
        'osn', 'usn_income', 'usn_income_outcome', 'envd', 'esn', 'patent'
    ]
    Payments: Payments | None
    Shops: list[Shops] | None


class ReceiptFFD12(ReceiptFFD105):
    """FFD 1.2 receipt."""


class Receipt(TypedDict):
    Receipt_FFD_105: ReceiptFFD105 | None
    Receipt_FFD_12: ReceiptFFD12 | None


class InitRequest(TypedDict):
    TerminalKey: str
    Amount: int
    OrderId: str
    Description: Optional[str]
    DATA: dict[str, str] | None
    Receipt: ReceiptFFD105 | ReceiptFFD12 | None
    PayType: Optional[str]
    Recurrent: Optional[str]
    CustomerKey: Optional[str]
    RedirectDueDate: Optional[str]
    NotificationURL: Optional[str]
    SuccessURL: Optional[str]
    FailURL: Optional[str]
    Language: Optional[str]
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
    CIT_CNC = '0'
    CIT_CC = '1'
    CIT_COF = '2'
    CIT_COF_R = 'R'
    CIT_COF_I = 'I'


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
    # https://www.tbank.ru/kassa/dev/payments/#section/Peredacha-priznaka-iniciatori-operacii


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
