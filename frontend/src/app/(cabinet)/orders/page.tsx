// app/(cabinet)/orders/page.tsx
import type {Metadata} from "next";
import OrdersPageClient from "./OrdersPageClient";

export const metadata: Metadata = {
    title: "Orders - XLARTAS",
};

export default function OrdersPage() {
    return <OrdersPageClient/>;
}
