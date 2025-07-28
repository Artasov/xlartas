import type { Metadata } from "next";
import Softwares from "../../Modules/Software/Softwares";
import { FC } from "wide-containers";
import { useTranslation } from "react-i18next";

export const metadata: Metadata = {
  title: "Softwares - XLARTAS",
  description: "Explore available software on XLARTAS platform",
};

export default function SoftwaresPage() {
  const { t } = useTranslation();
  return (
    <FC g={2} p={2} mx={"auto"} maxW={800}>
      <h1 className={"fs-1 lh-1 text-center"}>{t("softwares")}</h1>
      <Softwares />
    </FC>
  );
}
