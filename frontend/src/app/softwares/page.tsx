// app/softwares/page.tsx
import type {Metadata} from "next";
import SoftwaresPageClient from "./SoftwaresPageClient";
import {API_BASE_URL} from "Api/axiosConfig";
import {ISoftware} from "Software/Types/Software";
import {cookies} from "next/headers";

export const metadata: Metadata = {
    title: "Softwares - XLARTAS",
    description: "Explore available software on XLARTAS platform",
};

export const revalidate = 60;

export default async function SoftwaresPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('access')?.value;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/software/`, {
        headers,
        next: {revalidate: 60},
    });
    const softwares: ISoftware[] = await res.json();
    return <SoftwaresPageClient softwares={softwares}/>;
}
