// Modules/FileHost/Master.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useApi} from 'Api/useApi';
import {IFile} from './types';
import FileGrid from './FileGrid';
import FileTable from './FileTable';
import {FC, FR, FRBC, FRSE} from 'wide-containers';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import UploadProgressWindow from './UploadProgressWindow';
import useFileUpload from './useFileUpload';
import useFolderPath from './useFolderPath';
import PathBreadcrumbs from './PathBreadcrumbs';
import ViewModeSwitcher from './ViewModeSwitcher';
import CreateFolderDialog from './CreateFolderDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import ContextMenu from './ContextMenu';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import OutboundRoundedIcon from '@mui/icons-material/OutboundRounded';
import {IconButton, useMediaQuery} from '@mui/material';
import FileUpload from 'UI/FileUpload';
import {useNavigate, useParams} from 'react-router-dom';
import DropOverlay from './DropOverlay';
import {setFolderCached} from './storageCache';
import useFileHost from './useFileHost';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import {useTheme} from "Theme/ThemeContext";

const Master: React.FC = () => {
    const {api} = useApi();
    const {plt} = useTheme();
    const {id} = useParams();
    const folderId = id ? Number(id) : null;
    // const {t} = useTranslation();
    const navigate = useNavigate();
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const {handleUpload: uploadFile, uploads, clearUploads} = useFileUpload(folderId);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {folders, folder, files, load, refreshCaches} = useFileHost(folderId);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<IFile[]>([]);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [context, setContext] = useState<{ x: number; y: number } | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [view, setView] = useState<'cards' | 'table'>('cards');

    const path = useFolderPath(folder);

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x => x.id === f.id) ? prev.filter(x => x.id !== f.id) : [...prev, f]);
    };

    useEffect(() => {
        if (selected.length === 0) setSelectMode(false);
    }, [selected]);

    const deleteSelected = async () => {
        await api.post('/api/v1/filehost/items/bulk_delete/', {file_ids: selected.map(s => s.id)});
        setSelected([]);
        refreshCaches();
        load();
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) return;
        setConfirmOpen(true);
    };

    const handleUpload = async (file: File | null) => {
        await uploadFile(file);
        refreshCaches();
        load();
    };

    const handleCreateFolder = async () => {
        await api.post('/api/v1/filehost/folder/add/', {name: newFolderName, parent_id: folderId});
        setShowCreate(false);
        setNewFolderName('');
        refreshCaches();
        load();
    };

    const handleDeleteFolder = async (id: number) => {
        await api.delete('/api/v1/filehost/item/delete/', {data: {folder_id: id}});
        refreshCaches();
        load();
    };

    const openFolder = (fid: number) => {
        setSelected([]);
        setSelectMode(false);
        navigate(`/storage/master/${fid}/`);
    };

    return (
        <>
            <DropOverlay onFileDrop={handleUpload}/>
            <PathBreadcrumbs path={path}
                             onNavigate={fid => navigate(fid ? `/storage/master/${fid}/` : '/storage/master/')}/>
            <FC g={0.5}
                ref={containerRef}
                onContextMenu={e => {
                    if (e.target === containerRef.current) {
                        e.preventDefault();
                        setContext({x: e.clientX, y: e.clientY});
                    }
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]).then();
                }}>
                <FRBC g={1} bg={plt.text.primary + '11'} rounded={2} p={.8}>
                    <FRSE>
                        {selectMode && (<>
                            <IconButton
                                aria-label="move"
                                onClick={() => setShowMove(true)}
                            >
                                <OutboundRoundedIcon/>
                            </IconButton>
                            <IconButton
                                aria-label="delete"
                                onClick={handleDeleteSelected}
                            >
                                <DeleteForeverRoundedIcon/>
                            </IconButton>
                        </>)}
                        <FR>
                            <FileUpload onFileSelect={handleUpload}/>
                            <IconButton onClick={() => setShowCreate(true)}>
                                <CreateNewFolderRoundedIcon/>
                            </IconButton>
                        </FR>
                    </FRSE>
                    <FR>
                        <ViewModeSwitcher view={view} onChange={setView}/>
                    </FR>
                </FRBC>
                {view === 'cards' ? (
                    <FileGrid
                        folders={folders}
                        files={files}
                        selectMode={selectMode}
                        selected={selected}
                        onToggleSelect={toggleSelect}
                        onSelectMode={f => {
                            setSelectMode(true);
                            toggleSelect(f);
                        }}
                        onDeleteFile={f => {
                            setSelected([f]);
                            setConfirmOpen(true);
                        }}
                        onShareFile={f => setShowShare(f)}
                        onDownloadFile={file => window.open(file.file)}
                        onDeleteFolder={handleDeleteFolder}
                        onOpenFolder={openFolder}
                        reload={load}
                        parentId={folderId}
                    />
                ) : (
                    <FileTable
                        folders={folders}
                        files={files}
                        selectMode={selectMode}
                        selected={selected}
                        showColumns={isGtSm}
                        onToggleSelect={toggleSelect}
                        onSelectMode={f => {
                            setSelectMode(true);
                            toggleSelect(f);
                        }}
                        onDeleteFile={f => {
                            setSelected([f]);
                            setConfirmOpen(true);
                        }}
                        onShareFile={f => setShowShare(f)}
                        onDownloadFile={file => window.open(file.file)}
                        onDeleteFolder={handleDeleteFolder}
                        onOpenFolder={openFolder}
                        reload={load}
                        parentId={folderId}
                    />
                )}

                <ContextMenu
                    anchor={context}
                    onClose={() => setContext(null)}
                    onUpload={handleUpload}
                    onCreateFolder={() => setShowCreate(true)}
                />

                <MoveDialog
                    files={selected}
                    open={showMove}
                    onMoved={tid => setFolderCached(tid, undefined as any)}
                    onClose={() => {
                        setShowMove(false);
                        setSelected([]);
                        refreshCaches();
                        load();
                    }}
                />
                <ShareDialog file={showShare} open={!!showShare} onClose={() => setShowShare(null)}/>

                <ConfirmDeleteDialog
                    open={confirmOpen}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={async () => {
                        await deleteSelected();
                        setConfirmOpen(false);
                    }}
                />

                <CreateFolderDialog
                    open={showCreate}
                    value={newFolderName}
                    onChange={setNewFolderName}
                    onCreate={handleCreateFolder}
                    onClose={() => setShowCreate(false)}
                />

                {uploads.length > 0 && (
                    <UploadProgressWindow
                        items={uploads}
                        onClose={clearUploads}
                        onShare={f => setShowShare(f)}
                    />
                )}
            </FC>
        </>
    );
};

export default Master;
