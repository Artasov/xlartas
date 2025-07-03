import React, {useEffect, useRef, useState} from 'react';
import {useApi} from '../Api/useApi';
import {IFile, IFolder} from './types';
import FileCard from './FileCard';
import FolderCard from './FolderCard';
import {FC, FRSE} from 'wide-containers';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import UploadProgressWindow from './UploadProgressWindow';
import useFileUpload from './useFileUpload';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Menu, MenuItem} from '@mui/material';
import FileUpload from 'UI/FileUpload';
import {useTranslation} from 'react-i18next';
import {useParams, useNavigate} from 'react-router-dom';

const Master: React.FC = () => {
    const {api} = useApi();
    const {id} = useParams();
    const folderId = id ? Number(id) : null;
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {handleUpload: uploadFile, uploads} = useFileUpload(folderId);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [folder, setFolder] = useState<IFolder | null>(null);
    const [files, setFiles] = useState<IFile[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<IFile[]>([]);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [context, setContext] = useState<{x:number;y:number}|null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const load = () => {
        api.post('/api/v1/filehost/folder/content/', {id: folderId}).then(data => {
            setFolders(data.folders);
            setFiles(data.files);
            setFolder(data.folder);
        });
    };
    useEffect(() => {load();}, [api, folderId]);

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x=>x.id===f.id) ? prev.filter(x=>x.id!==f.id) : [...prev,f]);
    };

    useEffect(()=>{if(selected.length===0) setSelectMode(false);},[selected]);

    const deleteSelected = async () => {
        await api.post('/api/v1/filehost/items/bulk_delete/', {file_ids: selected.map(s=>s.id)});
        setSelected([]);
        load();
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) return;
        setConfirmOpen(true);
    };

    const handleUpload = async (file: File | null) => {
        await uploadFile(file);
        load();
    };

    const handleCreateFolder = async () => {
        await api.post('/api/v1/filehost/folder/add/', {name:newFolderName, parent_id: folderId});
        setShowCreate(false); setNewFolderName(''); load();
    };

    const handleDeleteFolder = async (id: number) => {
        await api.delete('/api/v1/filehost/item/delete/', {data:{folder_id:id}});
        load();
    };

    return (
        <FC g={0.5}
            ref={containerRef}
            onContextMenu={e=>{if(e.target===containerRef.current){e.preventDefault();setContext({x:e.clientX,y:e.clientY});}}}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);}}>
            {selectMode && (
                <FRSE g={1}>
                    <Button onClick={()=>setShowMove(true)}>{t('move')}</Button>
                    <Button onClick={handleDeleteSelected}>{t('delete')}</Button>
                </FRSE>
            )}
            <FRSE g={1}>
                {folder?.parent !== null && <Button onClick={()=>navigate(`/storage/master/${folder?.parent || ''}/`)}>{t('back')}</Button>}
                <Button onClick={()=>setShowCreate(true)}>{t('create_folder')}</Button>
                <FileUpload onFileSelect={handleUpload}/>
            </FRSE>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {folders.map(f => (
                    <FolderCard key={f.id} id={f.id} name={f.name} onDelete={handleDeleteFolder} onRenamed={load}/>
                ))}
                {files
                    .sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())
                    .map(f => (
                        <FileCard key={f.id} file={f} selectMode={selectMode} selected={!!selected.find(s=>s.id===f.id)}
                                 onToggleSelect={toggleSelect}
                                 onSelectMode={()=>{setSelectMode(true); toggleSelect(f);}}
                                 onDelete={()=>{setSelected([f]); setConfirmOpen(true);}}
                                 onShare={()=>setShowShare(f)}
                                 onDownload={file=>window.open(file.file)}/>
                    ))}
            </div>

            <Menu open={!!context} onClose={()=>setContext(null)} anchorReference="anchorPosition"
                  anchorPosition={context ? {top: context.y, left: context.x} : undefined}>
                <MenuItem>
                    <label style={{cursor:'pointer'}}>
                        {t('upload_file')}
                        <input type="file" hidden onChange={e=>{if(e.target.files&&e.target.files[0]){handleUpload(e.target.files[0]); setContext(null);}}}/>
                    </label>
                </MenuItem>
                <MenuItem onClick={()=>{setShowCreate(true); setContext(null);}}>{t('create_folder')}</MenuItem>
            </Menu>

            <MoveDialog files={selected} open={showMove} onClose={()=>{setShowMove(false); setSelected([]); load();}}/>
            <ShareDialog file={showShare} open={!!showShare} onClose={()=>setShowShare(null)}/>

            <Dialog open={confirmOpen} onClose={()=>setConfirmOpen(false)}>
                <DialogTitle>{t('delete')}</DialogTitle>
                <DialogActions>
                    <Button onClick={()=>setConfirmOpen(false)}>{t('cancel')}</Button>
                    <Button color="error" onClick={async()=>{await deleteSelected(); setConfirmOpen(false);}}>{t('delete')}</Button>
                </DialogActions>
            </Dialog>

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
