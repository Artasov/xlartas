import dynamic from "next/dynamic";
import type { Metadata } from "next";

const RootApp = dynamic(() => import("../../App"));

export const metadata: Metadata = {
  title: "Converter - XLARTAS",
  description: "Convert your files on the XLARTAS platform",
};

export default function ConverterPage() {
  return <RootApp />;
}
