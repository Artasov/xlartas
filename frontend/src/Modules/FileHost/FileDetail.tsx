import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import {FC, FR} from 'wide-containers';
import BackButton from "Core/components/BackButton";

const FileDetail: React.FC = () => {
    const {id} = useParams();
    const {api} = useApi();
    const navigate = useNavigate();
    const [file, setFile] = useState<IFile | null>(null);
    useEffect(() => {
        if (id) api.post('/api/v1/filehost/file/', {id: Number(id)}).then(setFile);
    }, [id]);
    if (!file) return null;
    return (
        <FC g={1} px={2} mt={1}>
            <BackButton/>
            <FR component={'h3'}>{file.name}</FR>
            <a href={file.file} target="_blank" rel="noreferrer">Open</a>
        </FC>
    );
};

export default FileDetail;
