import dynamic from "next/dynamic";
import type { Metadata } from "next";

const RootApp = dynamic(() => import("../App"));

export const metadata: Metadata = {
  title: "XLARTAS",
  description: "Landing page of XLARTAS platform",
};

export default function Home() {
  return <RootApp />;
}
