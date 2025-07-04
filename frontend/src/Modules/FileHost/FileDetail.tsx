import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import {FC, FR} from 'wide-containers';

import formatFileSize from 'Utils/formatFileSize';
import {useTranslation} from 'react-i18next';
import BackButton from "Core/components/BackButton";
import ShareDialog from './ShareDialog';
import FileActions from './FileActions';

const FileDetail: React.FC = () => {
    const {id} = useParams();
    const {api} = useApi();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [file, setFile] = useState<IFile | null>(null);
    const [showShare, setShowShare] = useState(false);
    useEffect(() => {
        if (id) api.post('/api/v1/filehost/file/', {id: Number(id)}).then(setFile);
    }, [id]);
    if (!file) return null;
    return (
        <FC g={1} px={2} mt={1}>
            <BackButton/>
            <FR component={'h3'}>{file.name}</FR>
            <FR>{t('upload_date')}: {new Date(file.created_at).toLocaleString()}</FR>
            <FR>{t('size')}: {formatFileSize(file.size)}</FR>
            <FileActions
                file={file}
                variant="buttons"
                onDownload={() => window.open(file.file)}
                onShare={() => setShowShare(true)}
                onDelete={async (f)=>{
                    await api.delete('/api/v1/filehost/item/delete/', {data:{file_id:f.id}});
                    navigate(-1);
                }}
            />
            <ShareDialog file={file} open={showShare} onClose={() => setShowShare(false)}/>
        </FC>
    );
};

export default FileDetail;
