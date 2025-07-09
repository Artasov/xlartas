import {useEffect, useState} from 'react';
import {useApi} from '../Api/useApi';
import {IFolder} from './types';

const useFolderPath = (folder: IFolder | null) => {
    const {api} = useApi();
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
                cur = await api.post('/api/v1/filehost/folder/', {id: cur.parent});
            }
            setPath(p);
        };
        build();
    }, [folder, api]);

    return path;
};

export default useFolderPath;
