// app/softwares/SoftwaresPageClient.tsx
"use client";

import Softwares from "../../Modules/Software/Softwares";
import {FC} from "wide-containers";

export default function SoftwaresPageClient() {
    return (
        <FC g={2} p={2} mx={"auto"} maxW={800}>
            <Softwares />
        </FC>
    );
}
