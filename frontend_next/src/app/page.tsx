"use client";

import dynamic from "next/dynamic";

const RootApp = dynamic(() => import("../App"), { ssr: false });

export default function Home() {
  return <RootApp />;
}
