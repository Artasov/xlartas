export interface IFile {
    id: number;
    name: string;
    file: string;
    folder: number | null;
    is_favorite: boolean;
    created_at: string;
    size: number;
}

export interface IFolder {
    id: number;
    name: string;
    parent: number | null;
}
