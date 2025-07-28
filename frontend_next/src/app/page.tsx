import dynamic from "next/dynamic";
const RootApp = dynamic(() => import("../App"));

export default function Home() {
  return <RootApp />;
}
