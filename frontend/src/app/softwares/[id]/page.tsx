import type { Metadata } from "next";
import SoftwareDetail from "../../../Modules/Software/SoftwareDetail";
import { FC } from "wide-containers";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  return {
    title: `Software ${id} - XLARTAS`,
    description: `Details about software ${id} on XLARTAS platform`,
  };
}

export default function SoftwareDetailPage() {
  return (
    <FC g={2} p={2} mx={"auto"} maxW={700}>
      <SoftwareDetail />
    </FC>
  );
}
