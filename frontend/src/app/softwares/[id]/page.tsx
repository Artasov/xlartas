// app/softwares/[id]/page.tsx
import type { Metadata } from "next";
import SoftwareDetailPageClient from "./SoftwareDetailPageClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Software ${id} - XLARTAS`,
    description: `Details about software ${id} on XLARTAS platform`,
  };
}

export default function SoftwareDetailPage() {
  return <SoftwareDetailPageClient />;
}
