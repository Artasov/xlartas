import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import {FC} from 'wide-containers';

const FileDetail: React.FC = () => {
    const {id} = useParams();
    const {api} = useApi();
    const [file, setFile] = useState<IFile | null>(null);
    useEffect(() => {
        if (id) api.post('/api/v1/filehost/file/', {id: Number(id)}).then(setFile);
    }, [id]);
    if (!file) return null;
    return (
        <FC g={1} p={2}>
            <h3>{file.name}</h3>
            <a href={file.file} target="_blank" rel="noreferrer">Open</a>
        </FC>
    );
};

export default FileDetail;
