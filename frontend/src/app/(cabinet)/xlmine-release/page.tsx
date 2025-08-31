// app/(cabinet)/xlmine-release/page.tsx
import type {Metadata} from "next";
import XLMineReleasesPageClient from "./XLMineReleasesPageClient";

export const metadata: Metadata = {
    title: "XLMine Releases - XLARTAS",
};

export default function XLMineReleasesPage() {
    return <XLMineReleasesPageClient/>;
}
