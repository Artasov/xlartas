// app/(cabinet)/softwares/[id]/page.tsx
import type {Metadata} from "next";
import SoftwareDetailPageClient from "./SoftwareDetailPageClient";
import {API_BASE_URL} from "Api/axiosConfig";
import {ISoftware} from "Software/Types/Software";
import {cookies} from "next/headers";

type PageProps = {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {id} = await params;
    return {
        title: `Software ${id} - XLARTAS`,
        description: `Details about software ${id} on XLARTAS platform`,
    };
}

export const revalidate = 60;

export default async function SoftwareDetailPage({params}: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access')?.value;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const { id } = await params;
    const res = await fetch(`${API_BASE_URL}/api/v1/software/${id}/`, {
        headers,
        next: {revalidate: 60},
    });
    const software: ISoftware = await res.json();
    return <SoftwareDetailPageClient software={software}/>;
}
