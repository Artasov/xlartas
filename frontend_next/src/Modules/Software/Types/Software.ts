// Modules/Software/Types/Software.ts
import {IProduct} from "types/commerce/shop";

export interface ISoftwareFile {
    id: number;
    file: string;
    version: string;
}

export interface ISoftware extends IProduct {
    min_license_order_hours: number;
    test_period_days: number;
    log_changes: string;
    review_url: string;
    guide_url: string;
    file?: ISoftwareFile;
}

export interface WirelessMacro {
    id: number;
    name: string;
    priority: number;
}