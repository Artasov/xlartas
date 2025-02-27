// Modules/Company/Types.ts
export interface CompanyDocument {
    id: number;
    title: string;
    file_url: string | null;
    content: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: number;
    person_name?: string | null;
    name: string;
    address: string;
    resource_url: string | null;
    ogrn: string;
    inn: string;
    bik: string;
    current_account: string;
    checking_account: string;
    created_at: string;
    updated_at: string;
    documents: CompanyDocument[];
}