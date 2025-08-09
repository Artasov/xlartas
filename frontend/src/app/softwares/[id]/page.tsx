// app/softwares/[id]/page.tsx
import type {Metadata} from "next";
import SoftwareDetailPageClient from "./SoftwareDetailPageClient";
import {API_BASE_URL} from "Api/axiosConfig";
import {ISoftware} from "Software/Types/Software";
import {cookies} from "next/headers";

interface PageProps {
    params: { id: string };
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {id} = params;
    return {
        title: `Software ${id} - XLARTAS`,
        description: `Details about software ${id} on XLARTAS platform`,
    };
}

export const revalidate = 60;

export default async function SoftwareDetailPage({params}: PageProps) {
    const cookieStore = cookies();
    const token = cookieStore.get('access')?.value;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/software/${params.id}/`, {
        headers,
        next: {revalidate: 60},
    });
    const software: ISoftware = await res.json();
    return <SoftwareDetailPageClient software={software}/>;
}
