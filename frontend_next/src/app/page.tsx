"use client";

import dynamic from "next/dynamic";

// Enable server-side rendering for the RootApp component by removing
// the `ssr: false` option. Dynamic imports default to SSR enabled.
const RootApp = dynamic(() => import("../App"));

export default function Home() {
  return <RootApp />;
}
