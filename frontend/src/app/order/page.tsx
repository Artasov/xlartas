// app/order/page.tsx
import type { Metadata } from "next";
import OrderTemplate from "../../Modules/Order/OrderTemplate";

export const metadata: Metadata = {
  title: "Order - XLARTAS",
  description: "Create an order on XLARTAS platform",
};

export default function OrderPage() {
  return <OrderTemplate />;
}
