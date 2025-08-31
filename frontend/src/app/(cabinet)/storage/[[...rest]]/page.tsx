// app/(cabinet)/storage/[...rest]/page.tsx
import type {Metadata} from "next";
import StoragePageClient from "./StoragePageClient";

export const metadata: Metadata = {
    title: "Storage - XLARTAS",
};

export default function StoragePage() {
    return <StoragePageClient/>;
}
