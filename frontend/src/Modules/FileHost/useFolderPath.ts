// Modules/FileHost/useFolderPath.ts
import {useEffect, useState} from 'react';
import {useFileHostApi} from 'FileHost/useFileHostApi';
import {IFolder} from './types';

const useFolderPath = (folder: IFolder | null) => {
    const {getFolder} = useFileHostApi();
    const [path, setPath] = useState<IFolder[]>([]);

    useEffect(() => {
        const build = async () => {
            if (!folder) {
                setPath([]);
                return;
            }
            const p: IFolder[] = [];
            let cur: IFolder | null = folder;
            while (cur) {
                p.unshift(cur);
                if (cur.parent === null) break;
                cur = await getFolder(cur.parent);
            }
            setPath(p);
        };
        build().then();
    }, [folder, getFolder]);

    return path;
};

export default useFolderPath;
