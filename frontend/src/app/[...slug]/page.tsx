// app/[...slug]/page.tsx
import type { Metadata } from "next";
import Cabinet from "../../Modules/Cabinet/Cabinet";

export const metadata: Metadata = {
  title: "XL | Profile",
  description: "User cabinet",
};

export default function CabinetPage() {
  return <Cabinet />;
}
