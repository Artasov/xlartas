// app/(cabinet)/softwares/SoftwaresPageClient.tsx
"use client";

import Softwares from "Software/Softwares";
import {FC, FRCC} from "wide-containers";
import {ISoftware} from "Software/Types/Software";
import {useAuth} from "Auth/AuthContext";
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";

interface SoftwaresPageClientProps {
    softwares: ISoftware[];
}

export default function SoftwaresPageClient({softwares}: SoftwaresPageClientProps) {
    const {isAuthenticated, user} = useAuth();

    // Gate rendering until auth is resolved or explicitly not authenticated.
    const authPending = isAuthenticated === null || (isAuthenticated === true && !user);
    if (authPending) {
        return (
            <FRCC w={'100%'} h={'60vh'}>
                <CircularProgressZoomify in={true} size={'64px'}/>
            </FRCC>
        );
    }

    return (
        <FC g={2} p={2} mx={"auto"} maxW={800}>
            <Softwares initialSoftwares={softwares}/>
        </FC>
    );
}
