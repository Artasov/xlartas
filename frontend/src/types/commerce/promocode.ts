import {IUser} from "types/core/user";
import {ICurrency, IProduct} from "types/commerce/shop";

export interface IPromocode {
    id: number
    name: string;
    code: string;
    description?: string;
    discounts: IPromocodeDiscount[];
    discount_type: 'percentage' | 'fixed_amount';
    start_date?: string; // дата и время
    end_date?: string; // дата и время
}


export interface IPromocodeDiscount {
    id: number;
    product: IProduct | number;
    currency: ICurrency;
    amount: number;
    max_usage?: number;
    max_usage_per_user?: number;
    interval_days?: number;
    specific_users?: IUser[];
}

export interface IPromocodeUsage {
    id: number
    promocode: IPromocode;
    user: IUser;
    created_at: string;
}
