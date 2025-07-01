import React, {useEffect, useState} from 'react';
import {useApi} from '../Api/useApi';
import {IFile, IFolder} from './types';
import FileItem from './FileItem';
import {FC, FRSE} from 'wide-containers';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import UploadProgressWindow, {UploadItem} from './UploadProgressWindow';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import FileUpload from 'UI/FileUpload';
import {useTranslation} from 'react-i18next';

const Master: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [files, setFiles] = useState<IFile[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<IFile[]>([]);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    const load = () => {
        api.post('/api/v1/filehost/folder/content/', {id: null}).then(data => {
            setFolders(data.folders);
            setFiles(data.files);
        });
    };
    useEffect(() => {load();}, [api]);

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x=>x.id===f.id) ? prev.filter(x=>x.id!==f.id) : [...prev,f]);
    };

    useEffect(()=>{if(selected.length===0) setSelectMode(false);},[selected]);

    const handleDeleteSelected = async () => {
        await api.post('/api/v1/filehost/items/bulk_delete/', {file_ids: selected.map(s=>s.id)});
        setSelected([]); load();
    };

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        const item: UploadItem = {name:file.name, progress:0};
        setUploads(prev=>[...prev,item]);
        const formData = new FormData();
        formData.append('files', file);
        await api.post('/api/v1/filehost/files/upload/', formData, {
            headers:{'Content-Type':'multipart/form-data'},
            onUploadProgress:e=>{
                item.progress = Math.round((e.loaded/e.total)*100);
                setUploads(u=>[...u]);
            }
        });
        setUploads(u=>u.filter(i=>i!==item));
        load();
    };

    const handleCreateFolder = async () => {
        await api.post('/api/v1/filehost/folder/add/', {name:newFolderName});
        setShowCreate(false); setNewFolderName(''); load();
    };

    return (
        <FC g={0.5} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);}}>
            {selectMode && (
                <FRSE g={1}>
                    <Button onClick={()=>setShowMove(true)}>{t('move')}</Button>
                    <Button onClick={handleDeleteSelected}>{t('delete')}</Button>
                </FRSE>
            )}
            <FRSE g={1}>
                <Button onClick={()=>setShowCreate(true)}>{t('create_folder')}</Button>
                <FileUpload onFileSelect={handleUpload}/>
            </FRSE>
            {folders.map(f => <div key={f.id}>{f.name}</div>)}
            {files.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).map(f => (
                <FileItem key={f.id} file={f} selectMode={selectMode} selected={!!selected.find(s=>s.id===f.id)}
                          onToggleSelect={toggleSelect}
                          onSelectMode={()=>{setSelectMode(true); toggleSelect(f);}}
                          onDelete={()=>{setSelected([f]); handleDeleteSelected();}}
                          onShare={()=>setShowShare(f)}
                          onDownload={file=>window.open(file.file)}/>
            ))}

            <MoveDialog files={selected} open={showMove} onClose={()=>{setShowMove(false); setSelected([]); load();}}/>
            <ShareDialog file={showShare} open={!!showShare} onClose={()=>setShowShare(null)}/>

            <Dialog open={showCreate} onClose={()=>setShowCreate(false)}>
                <DialogTitle>{t('create_folder')}</DialogTitle>
                <DialogContent>
                    <TextField label={t('folder_name')} value={newFolderName} onChange={e=>setNewFolderName(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setShowCreate(false)}>{t('cancel')}</Button>
                    <Button onClick={handleCreateFolder}>{t('create_folder')}</Button>
                </DialogActions>
            </Dialog>

            {uploads.length>0 && <UploadProgressWindow items={uploads}/>}            
        </FC>
    );
};

export default Master;
