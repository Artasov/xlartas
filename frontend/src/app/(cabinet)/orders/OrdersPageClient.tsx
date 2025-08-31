// app/(cabinet)/orders/OrdersPageClient.tsx
"use client";
import {FCSS} from "wide-containers";
import UserOrders from "Order/UserOrders";

export default function OrdersPageClient() {
    return (
        <FCSS scroll={'y-auto'} h={'100%'} g={1} pt={2} p={1}>
            <UserOrders/>
        </FCSS>
    );
}

