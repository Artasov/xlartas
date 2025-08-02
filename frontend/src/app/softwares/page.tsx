// app/softwares/page.tsx
import type {Metadata} from "next";
import SoftwaresPageClient from "./SoftwaresPageClient";

export const metadata: Metadata = {
    title: "Softwares - XLARTAS",
    description: "Explore available software on XLARTAS platform",
};

export default function SoftwaresPage() {
    return <SoftwaresPageClient />;
}
