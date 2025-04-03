// Modules/xLMine/types/base.ts
export interface IRelease {
    id: number;
    file: string;
    version: string;
    sha256_hash: string;
    created_at: string;
    updated_at: string;
}

export interface ILauncher {
    id: number;
    file: string;
    version: string;
    sha256_hash: string;
    created_at: string;
    updated_at: string;
}
export interface IPrivilege {
    id: string;
    name: string;
    threshold: string;
    description?: string;
    color?: string | null;
}