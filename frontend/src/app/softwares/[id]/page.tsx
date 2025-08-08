// app/softwares/[id]/page.tsx
import type {Metadata} from "next";
import SoftwareDetailPageClient from "./SoftwareDetailPageClient";

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

export default function SoftwareDetailPage() {
    // просто рендерим клиентский, без пропсов
    return <SoftwareDetailPageClient/>;
}
