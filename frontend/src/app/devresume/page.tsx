import type { Metadata } from "next";
import DevResumePage from "../../Modules/DevResume/DevResumePage";

export const metadata: Metadata = {
  title: "Dev Resume - XLARTAS",
  description: "Developer resume",
};

export default function Page() {
  return <DevResumePage />;
}
