// app/(cabinet)/orders/[id]/page.tsx
import type {Metadata} from "next";
import OrderDetailPageClient from "./OrderDetailPageClient";

export const metadata: Metadata = {
    title: "Order Detail - XLARTAS",
};

export default function OrderDetailPage() {
    return <OrderDetailPageClient/>;
}
