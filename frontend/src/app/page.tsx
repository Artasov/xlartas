// app/page.tsx
import type {Metadata} from "next";
import Landing from "../Modules/Landing/Landing";

export const metadata: Metadata = {
    title: "XLARTAS",
    description: "Landing page of XLARTAS platform",
};

export default function Home() {
    return <Landing/>;
}
