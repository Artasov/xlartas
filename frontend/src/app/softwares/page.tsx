import dynamic from "next/dynamic";
import type { Metadata } from "next";

// SSR support for RootApp
const RootApp = dynamic(() => import("../../App"));

export const metadata: Metadata = {
  title: "Softwares - XLARTAS",
  description: "Explore available software on XLARTAS platform",
};

export default function SoftwaresPage() {
  return <RootApp />;
}
