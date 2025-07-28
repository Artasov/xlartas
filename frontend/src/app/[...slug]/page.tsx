import type { Metadata } from "next";
import Cabinet from "../../Modules/Cabinet/Cabinet";

export const metadata: Metadata = {
  title: "Cabinet - XLARTAS",
  description: "User cabinet",
};

export default function CabinetPage() {
  return <Cabinet />;
}
