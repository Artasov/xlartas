// app/softwares/[id]/SoftwareDetailPageClient.tsx
"use client";

import {FC} from "wide-containers";
import {useParams} from "next/navigation";
import SoftwareDetail from "../../../Modules/Software/SoftwareDetail";

export default function SoftwareDetailPageClient() {
    const params = useParams();
    const id = params?.id;
    console.log("SoftwareDetailPageClient useParams id =", id);

    if (!id) {
        // защита на случай, если id всё ещё не прочитался
        return <p>Software ID not specified</p>;
    }

    return (
        <FC g={2} p={2} mx={"auto"} maxW={700}>
            <SoftwareDetail id={id}/>
        </FC>
    );
}
