// app/(cabinet)/wireless/page.tsx
import type {Metadata} from "next";
import WirelessPageClient from "./WirelessPageClient";

export const metadata: Metadata = {
    title: "Wireless - XLARTAS",
};

export default function WirelessPage() {
    return <WirelessPageClient/>;
}
