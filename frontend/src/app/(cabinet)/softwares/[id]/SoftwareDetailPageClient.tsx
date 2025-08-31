// app/(cabinet)/softwares/[id]/SoftwareDetailPageClient.tsx
"use client";

import {FC, FRCC} from "wide-containers";
import SoftwareDetail from "Software/SoftwareDetail";
import {ISoftware} from "Software/Types/Software";
import {useAuth} from "Auth/AuthContext";
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";

interface SoftwareDetailPageClientProps {
    software: ISoftware;
}

export default function SoftwareDetailPageClient({software}: SoftwareDetailPageClientProps) {
    const {isAuthenticated, user} = useAuth();

    const authPending = isAuthenticated === null || (isAuthenticated === true && !user);
    if (authPending) {
        return (
            <FRCC w={'100%'} h={'60vh'}>
                <CircularProgressZoomify in={true} size={'64px'}/>
            </FRCC>
        );
    }

    return (
        <FC g={2} p={2} mx={"auto"} maxW={700}>
            <SoftwareDetail initialSoftware={software}/>
        </FC>
    );
}
