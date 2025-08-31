// app/(cabinet)/softwares/[id]/SoftwareDetailPageClient.tsx
"use client";

import {FC} from "wide-containers";
import SoftwareDetail from "Software/SoftwareDetail";
import {ISoftware} from "Software/Types/Software";

interface SoftwareDetailPageClientProps {
    software: ISoftware;
}

export default function SoftwareDetailPageClient({software}: SoftwareDetailPageClientProps) {
    return (
        <FC g={2} p={2} mx={"auto"} maxW={700}>
            <SoftwareDetail initialSoftware={software}/>
        </FC>
    );
}
