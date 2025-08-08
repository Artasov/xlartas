// Modules/FileHost/useFileHost.ts
import {useEffect, useState} from 'react';
import {IFile, IFolder} from './types';
import {
    FolderContent,
    getFolderCached,
    setAllFilesCached,
    setFavoriteFilesCached,
    setFolderCached
} from './storageCache';
import {useFileHostApi} from './useFileHostApi';

const useFileHost = (folderId: number | null) => {
    const {getFolderContent} = useFileHostApi();
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [folder, setFolder] = useState<IFolder | null>(null);
    const [files, setFiles] = useState<IFile[]>([]);

    const refreshCaches = () => {
        setFolderCached(folderId, undefined as any);
        setAllFilesCached(undefined as any);
        setFavoriteFilesCached(undefined as any);
    };

    const load = () => {
        const cached = getFolderCached(folderId);
        if (cached) {
            setFolders(cached.folders);
            setFiles(cached.files);
            setFolder(cached.folder);
            return;
        }
        getFolderContent(folderId).then((data: FolderContent) => {
            setFolders(data.folders);
            setFiles(data.files);
            setFolder(data.folder);
            setFolderCached(folderId, data);
        });
    };

    useEffect(() => {
        load();
    }, [getFolderContent, folderId]);

    return {folders, folder, files, load, refreshCaches};
};

export default useFileHost;
