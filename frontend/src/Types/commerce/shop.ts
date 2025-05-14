// Types/commerce/shop.ts
import {IUser} from "types/core/user";
import {IPromocode} from "types/commerce/promocode";

export interface ICurrencyPaymentSystemMapping {
    get_payment(currency: string): IPaymentSystem[] | null;

    get_currencies(payment: string): string[];
}

export type IPaymentSystem =
    'handmade'
    | 'cloud_payment'
    | 'tbank'
    | 'stripe'
    | 'shopozz'
    | 'prodamus'
    | 'tbank_installment';

export type ICurrency = 'USD' | 'RUB' | 'EUR';

export interface ICurrencyWithPrice {
    currency: ICurrency;
    priceObject: IProductPrice | undefined;
}

export interface IProductPrice {
    id: number;
    product: IProduct | number | string;
    currency: string;
    amount: number;
    exponent?: number | null;
    offset?: number | null;
}

export interface IProduct {
    id: number
    name: string;
    pic: string;
    polymorphic_ctype: IPolymorphicContentType;
    description?: string;
    short_description?: string;
    is_installment_available: boolean;
    prices: IProductPrice[];
}

export interface IPolymorphicContentType {
    app_label: string;
    id: number;
    model: string;
    name: string;
}


export interface IPayment {
    order_id: string
    amount: number
    payment_url: string | null
}

export interface ITBankPayment extends IPayment {
    customer: number
    status: 'NEW' |
        'FORM_SHOWED' |
        'AUTHORIZING' |
        '3DS_CHECKING' |
        '3DS_CHECKED' |
        'AUTHORIZED' |
        'CONFIRMING' |
        'CONFIRMED' |
        'REVERSING' |
        'PARTIAL_REVERSED' |
        'REVERSED' |
        'REFUNDING' |
        'PARTIAL_REFUNDED' |
        'REFUNDED' |
        'CANCELED' |
        'DEADLINE_EXPIRED' |
        'REJECTED' |
        'AUTH_FAIL'
    source: string
}

export interface ITBankInstallment {
    id: number;
    token: string;
    product: IProduct;

    [key: string]: any;
}

export interface IOrder {
    id: number | string
    user: IUser | null;
    product: IProduct;
    promocode?: IPromocode | null;
    payment_system: IPaymentSystem;
    currency: 'USD' | 'RUB' | 'EUR';
    payment: IPayment;
    created_at: string;
    is_inited: boolean;
    is_paid: boolean;
    is_executed: boolean;
    is_cancelled: boolean;
    is_refunded: boolean;
}
