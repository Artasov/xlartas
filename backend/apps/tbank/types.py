# tbank/types.py
"""Typed structures and enums used by the TBank client."""
from enum import Enum
from typing import Optional, TypedDict


class PaymentMethod(str, Enum):
    """Method of payment."""

    FULL_PREPAYMENT = 'full_prepayment'
    PREPAYMENT = 'prepayment'
    ADVANCE = 'advance'
    FULL_PAYMENT = 'full_payment'
    PARTIAL_PAYMENT = 'partial_payment'
    CREDIT = 'credit'
    CREDIT_PAYMENT = 'credit_payment'


class PaymentObject(str, Enum):
    """Kind of paid item."""

    COMMODITY = 'commodity'
    EXCISE = 'excise'
    JOB = 'job'
    SERVICE = 'service'
    GAMBLING_BET = 'gambling_bet'
    GAMBLING_PRIZE = 'gambling_prize'
    LOTTERY = 'lottery'
    LOTTERY_PRIZE = 'lottery_prize'
    INTELLECTUAL_ACTIVITY = 'intellectual_activity'
    PAYMENT = 'payment'
    AGENT_COMMISSION = 'agent_commission'
    COMPOSITE = 'composite'
    ANOTHER = 'another'


class Tax(str, Enum):
    """VAT rate for a position."""

    NONE = 'none'
    VAT0 = 'vat0'
    VAT10 = 'vat10'
    VAT20 = 'vat20'
    VAT110 = 'vat110'
    VAT120 = 'vat120'


class Taxation(str, Enum):
    """Merchant taxation system."""

    OSN = 'osn'
    USN_INCOME = 'usn_income'
    USN_INCOME_OUTCOME = 'usn_income_outcome'
    ENVD = 'envd'
    ESN = 'esn'
    PATENT = 'patent'


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
    Tax: Tax
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
    Taxation: Taxation
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
