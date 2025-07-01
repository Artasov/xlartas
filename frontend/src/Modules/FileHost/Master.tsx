import React, {useEffect, useState} from 'react';
import {useApi} from '../Api/useApi';
import {IFile, IFolder} from './types';
import FileItem from './FileItem';
import {FC} from 'wide-containers';

const Master: React.FC = () => {
    const {api} = useApi();
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [files, setFiles] = useState<IFile[]>([]);

    useEffect(() => {
        api.post('/api/v1/filehost/folder/content/', {id: null}).then(data => {
            setFolders(data.folders);
            setFiles(data.files);
        });
    }, [api]);

    return (
        <FC g={0.5}>
            {folders.map(f => <div key={f.id}>{f.name}</div>)}
            {files.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).map(f => (
                <FileItem key={f.id} file={f}/>
            ))}
        </FC>
    );
};

export default Master;
