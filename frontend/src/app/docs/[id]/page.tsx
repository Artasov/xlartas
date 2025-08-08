// app/docs/[id]/page.tsx
import type {Metadata} from "next";
import CompanyDocumentDetail from "../../../Modules/Company/CompanyDocumentDetail";

export const metadata: Metadata = {
    title: "Document - XLARTAS",
    description: "Company document",
};

export default function DocumentPage() {
    return <CompanyDocumentDetail/>;
}
