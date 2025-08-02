"use client";

import SoftwareDetail from "../../../Modules/Software/SoftwareDetail";
import { FC } from "wide-containers";

export default function SoftwareDetailPageClient() {
  return (
    <FC g={2} p={2} mx={"auto"} maxW={700}>
      <SoftwareDetail />
    </FC>
  );
}
