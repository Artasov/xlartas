// app/(cabinet)/licenses/LicensesPageClient.tsx
"use client";
import {FCSS} from "wide-containers";
import Licenses from "Software/Licenses";

export default function LicensesPageClient() {
    return (
        <FCSS g={2} p={2}>
            <Licenses/>
        </FCSS>
    );
}

