import type {Metadata} from "next";
import Softwares from "../../Modules/Software/Softwares";
import {FC} from "wide-containers";

export const metadata: Metadata = {
    title: "Softwares - XLARTAS",
    description: "Explore available software on XLARTAS platform",
};

export default function SoftwaresPage() {
    return (
        <FC g={2} p={2} mx={"auto"} maxW={800}>
            <Softwares/>
        </FC>
    );
}
