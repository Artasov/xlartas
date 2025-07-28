import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Server-side rendering is enabled by default for dynamic imports.
const RootApp = dynamic(() => import("../../../App"));

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Software ${id} - XLARTAS`,
    description: `Details about software ${id} on XLARTAS platform`,
  };
}

export default function SoftwareDetailPage() {
  return <RootApp />;
}
