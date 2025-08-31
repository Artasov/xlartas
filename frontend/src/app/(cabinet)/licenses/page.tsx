// app/(cabinet)/licenses/page.tsx
import type {Metadata} from "next";
import LicensesPageClient from "./LicensesPageClient";

export const metadata: Metadata = {
    title: "Licenses - XLARTAS",
};

export default function LicensesPage() {
    return <LicensesPageClient/>;
}
