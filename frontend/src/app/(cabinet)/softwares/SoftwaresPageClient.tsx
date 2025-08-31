// app/(cabinet)/softwares/SoftwaresPageClient.tsx
"use client";

import Softwares from "Software/Softwares";
import {FC} from "wide-containers";
import {ISoftware} from "Software/Types/Software";

interface SoftwaresPageClientProps {
    softwares: ISoftware[];
}

export default function SoftwaresPageClient({softwares}: SoftwaresPageClientProps) {
    return (
        <FC g={2} p={2} mx={"auto"} maxW={800}>
            <Softwares initialSoftwares={softwares}/>
        </FC>
    );
}
