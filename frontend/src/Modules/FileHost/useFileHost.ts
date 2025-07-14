// Modules/FileHost/useFileHost.ts
import {useApi} from 'Api/useApi';
import {useEffect, useState} from 'react';
import {IFile, IFolder} from './types';
import {FolderContent, getFolderCached, setAllFilesCached, setFavoriteFilesCached, setFolderCached} from './storageCache';

const useFileHost = (folderId: number | null) => {
    const {api} = useApi();
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
        api.post('/api/v1/filehost/folder/content/', {id: folderId}).then((data: FolderContent) => {
            setFolders(data.folders);
            setFiles(data.files);
            setFolder(data.folder);
            setFolderCached(folderId, data);
        });
    };

    useEffect(() => {
        load();
    }, [api, folderId]);

    return {folders, folder, files, load, refreshCaches};
};

export default useFileHost;
