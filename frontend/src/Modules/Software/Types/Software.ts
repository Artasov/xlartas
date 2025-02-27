// Modules/Software/Types/Software.ts
import {IProduct} from "types/commerce/shop";

export interface ISoftwareFile {
    id: number;
    file: string;
    version: string;
}

export interface ISoftware extends IProduct {
    min_license_order_hours: number;
    review_url: string;
    file?: ISoftwareFile;
}