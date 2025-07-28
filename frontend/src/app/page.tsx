import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Enable server-side rendering for the RootApp component by using the default
// dynamic import behavior (SSR enabled).
const RootApp = dynamic(() => import("../App"));

export const metadata: Metadata = {
  title: "XLARTAS",
  description: "Landing page of XLARTAS platform",
};

export default function Home() {
  return <RootApp />;
}
