import {IOrder, IProduct} from "types/commerce/shop";

export interface IDonateProduct extends IProduct {

}

export interface IDonateOrder extends IOrder {
    product: IDonateProduct
}