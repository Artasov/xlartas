import {IOrder, IProduct} from "types/commerce/shop";

export interface IDonate extends IProduct {

}

export interface IDonateOrder extends IOrder {
    product: IDonate
}