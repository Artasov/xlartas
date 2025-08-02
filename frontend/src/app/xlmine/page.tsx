// app/xlmine/page.tsx
import type { Metadata } from "next";
import XLMineLanding from "../../Modules/xLMine/XLMineLanding";

export const metadata: Metadata = {
  title: "XLMine - XLARTAS",
  description: "XLMine launcher and features",
};

export default function XLMinePage() {
  return <XLMineLanding />;
}
