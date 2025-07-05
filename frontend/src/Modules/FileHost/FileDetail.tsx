import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useApi} from 'Api/useApi';
import {IFile} from './types';
import {Container, FC, FR, FRBC} from 'wide-containers';

import formatFileSize from 'Utils/formatFileSize';
import {useTranslation} from 'react-i18next';
import BackButton from "Core/components/BackButton";
import ShareDialog from './ShareDialog';
import ImagePreview from './ImagePreview';
import {isImage, isVideo} from './fileIcons';
import FileActions from "Modules/FileHost/FileActions";
import {useTheme} from "Theme/ThemeContext";

const FileDetail: React.FC = () => {
    const {id} = useParams();
    const {api} = useApi();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [file, setFile] = useState<IFile | null>(null);
    const [showShare, setShowShare] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const {plt} = useTheme();

    useEffect(() => {
        if (id) api.post('/api/v1/filehost/file/', {id: Number(id)}).then(setFile);
    }, [id]);
    if (!file) return null;

    return (
        <FC h={'100%'} scroll={'hidden'}>
            <FRBC bg={plt.text.primary + '11'} rounded={2} mt={.5} mb={.7} py={.4} zIndex={2} sx={{
                backdropFilter: 'blur(10px)'
            }}>
                <BackButton/>
                <FileActions
                    file={file}
                    variant="buttons"
                    onDownload={() => window.open(file.file)}
                    onShare={() => setShowShare(true)}
                    onDelete={async (f) => {
                        await api.delete('/api/v1/filehost/item/delete/', {data: {file_id: f.id}});
                        navigate(-1);
                    }}
                />
            </FRBC>
            <Container pb={1} scroll={'y-auto'} cls={'no-scrollbar'}>
                <FR component={'h3'} sx={{lineHeight: '1.3rem'}}>{file.name}</FR>
                <FR>{t('size')}: {formatFileSize(file.size)}</FR>
                <FR>{t('upload_date')}: {new Date(file.created_at).toLocaleString()}</FR>
                {isImage(file.name) && (
                    <img src={file.file} alt={file.name}
                         style={{maxWidth: '100%', maxHeight: '60vh', cursor: 'pointer'}}
                         onClick={() => setShowImage(true)}/>
                )}
                {isVideo(file.name) && (
                    <video src={file.file} controls style={{maxWidth: '100%', maxHeight: '60vh'}}/>
                )}
                <ShareDialog file={file} open={showShare} onClose={() => setShowShare(false)}/>
                {isImage(file.name) && (
                    <ImagePreview src={file.file} open={showImage} onClose={() => setShowImage(false)}/>
                )}</Container>
        </FC>
    );
};

export default FileDetail;
