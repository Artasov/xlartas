// app/companies/[name]/page.tsx
import type {Metadata} from "next";
import CompanyPage from "../../../Modules/Company/CompanyPage";

export const metadata: Metadata = {
    title: "Company - XLARTAS",
    description: "Company details",
};

export default function CompanyDetailPage() {
    return <CompanyPage/>;
}
