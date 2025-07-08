import React, {useEffect, useRef, useState} from 'react';
import {useApi} from '../Api/useApi';
import {IFile, IFolder} from './types';
import FileCard from './FileCard';
import FolderCard from './FolderCard';
import FileTableRow from './FileTableRow';
import FolderTableRow from './FolderTableRow';
import {FC, FR, FRBC, FRSE} from 'wide-containers';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import UploadProgressWindow from './UploadProgressWindow';
import useFileUpload from './useFileUpload';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import OutboundRoundedIcon from '@mui/icons-material/OutboundRounded';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    useMediaQuery
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FileUpload from 'UI/FileUpload';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import DropOverlay from './DropOverlay';
import {
    FolderContent,
    getFolderCached,
    setAllFilesCached,
    setFavoriteFilesCached,
    setFolderCached
} from './storageCache';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import {useTheme} from "Theme/ThemeContext";

const Master: React.FC = () => {
    const {api} = useApi();
    const {plt} = useTheme();
    const {id} = useParams();
    const folderId = id ? Number(id) : null;
    const {t} = useTranslation();
    const navigate = useNavigate();
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const {handleUpload: uploadFile, uploads, clearUploads} = useFileUpload(folderId);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [folder, setFolder] = useState<IFolder | null>(null);
    const [files, setFiles] = useState<IFile[]>([]);
    const [path, setPath] = useState<IFolder[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<IFile[]>([]);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [context, setContext] = useState<{ x: number; y: number } | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [view, setView] = useState<'cards' | 'table'>('cards');

    const load = () => {
        const cached = getFolderCached(folderId);
        if (cached) {
            setFolders(cached.folders);
            setFiles(cached.files);
            setFolder(cached.folder);
            return;
        }
        api.post('/api/v1/filehost/folder/content/', {id: folderId}).then((data: FolderContent) => {
            setFolders(data.folders);
            setFiles(data.files);
            setFolder(data.folder);
            setFolderCached(folderId, data);
        });
    };
    useEffect(() => {
        load();
    }, [api, folderId]);

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

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x => x.id === f.id) ? prev.filter(x => x.id !== f.id) : [...prev, f]);
    };

    useEffect(() => {
        if (selected.length === 0) setSelectMode(false);
    }, [selected]);

    const deleteSelected = async () => {
        await api.post('/api/v1/filehost/items/bulk_delete/', {file_ids: selected.map(s => s.id)});
        setSelected([]);
        setFolderCached(folderId, undefined as any);
        setAllFilesCached(undefined as any);
        setFavoriteFilesCached(undefined as any);
        load();
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) return;
        setConfirmOpen(true);
    };

    const handleUpload = async (file: File | null) => {
        await uploadFile(file);
        setFolderCached(folderId, undefined as any);
        setAllFilesCached(undefined as any);
        setFavoriteFilesCached(undefined as any);
        load();
    };

    const handleCreateFolder = async () => {
        await api.post('/api/v1/filehost/folder/add/', {name: newFolderName, parent_id: folderId});
        setShowCreate(false);
        setNewFolderName('');
        setFolderCached(folderId, undefined as any);
        setAllFilesCached(undefined as any);
        setFavoriteFilesCached(undefined as any);
        load();
    };

    const handleDeleteFolder = async (id: number) => {
        await api.delete('/api/v1/filehost/item/delete/', {data: {folder_id: id}});
        setFolderCached(folderId, undefined as any);
        setAllFilesCached(undefined as any);
        setFavoriteFilesCached(undefined as any);
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
            <FR g={0.5} px={2} flexWrap={'wrap'} bg={plt.text.primary + '11'} rounded={2} my={.4}>
                <Link underline="hover" onClick={() => navigate('/storage/master/')}
                      style={{cursor: 'pointer'}}>root</Link>
                {path.slice(1).map(p => (
                    <React.Fragment key={p.id}>
                        <span>/</span>
                        <Link underline="hover" onClick={() => navigate(`/storage/master/${p.id}/`)}
                              style={{cursor: 'pointer'}}>{p.name}</Link>
                    </React.Fragment>
                ))}
                <span>/</span>
            </FR>
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
                        <FR>
                            <IconButton onClick={() => setView('cards')}
                                        color={view === 'cards' ? 'primary' : 'default'}>
                                <ViewModuleIcon/>
                            </IconButton>
                            <IconButton onClick={() => setView('table')}
                                        color={view === 'table' ? 'primary' : 'default'}>
                                <ViewListIcon/>
                            </IconButton>
                        </FR>
                    </FR>
                </FRBC>
                {view === 'cards' ? (
                    <Box mt={.4} sx={{
                        display: 'grid',
                        gap: '0.5rem',
                        gridTemplateColumns: {
                            xs: 'repeat(2,1fr)',
                            sm: 'repeat(3,1fr)',
                            md: 'repeat(4,1fr)',
                            lg: 'repeat(4,1fr)'
                        }
                    }}>
                        {folders.map(f => (
                            <FolderCard
                                key={f.id}
                                id={f.id}
                                name={f.name}
                                onDelete={handleDeleteFolder}
                                onOpen={openFolder}
                                onRenamed={() => {
                                    setFolderCached(folderId, undefined as any);
                                    setAllFilesCached(undefined as any);
                                    setFavoriteFilesCached(undefined as any);
                                    load();
                                }}
                            />
                        ))}
                        {files
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(f => (
                                <FileCard key={f.id} file={f} selectMode={selectMode}
                                          selected={!!selected.find(s => s.id === f.id)}
                                          onToggleSelect={toggleSelect}
                                          onSelectMode={() => {
                                              setSelectMode(true);
                                              toggleSelect(f);
                                          }}
                                          onDelete={() => {
                                              setSelected([f]);
                                              setConfirmOpen(true);
                                          }}
                                          onShare={() => setShowShare(f)}
                                          onDownload={file => window.open(file.file)}/>
                            ))}
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{p: 0}}/>
                                <TableCell sx={{pl: 0}}>{t('name')}</TableCell>
                                {isGtSm && <TableCell>{t('upload_date')}</TableCell>}
                                {isGtSm && <TableCell>{t('size')}</TableCell>}
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {folders.map(f => (
                                <FolderTableRow
                                    key={f.id}
                                    id={f.id}
                                    name={f.name}
                                    onDelete={handleDeleteFolder}
                                    onOpen={openFolder}
                                    onRenamed={() => {
                                        setFolderCached(folderId, undefined as any);
                                        setAllFilesCached(undefined as any);
                                        setFavoriteFilesCached(undefined as any);
                                        load();
                                    }}
                                />
                            ))}
                            {files
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(f => (
                                    <FileTableRow key={f.id} file={f}
                                                  selectMode={selectMode}
                                                  selected={!!selected.find(s => s.id === f.id)}
                                                  onToggleSelect={toggleSelect}
                                                  onSelectMode={() => {
                                                      setSelectMode(true);
                                                      toggleSelect(f);
                                                  }}
                                                  onDelete={() => {
                                                      setSelected([f]);
                                                      setConfirmOpen(true);
                                                  }}
                                                  onShare={() => setShowShare(f)}
                                                  onDownload={file => window.open(file.file)}
                                    />
                                ))}
                        </TableBody>
                    </Table>
                )}

                <Menu open={!!context} onClose={() => setContext(null)} anchorReference="anchorPosition"
                      anchorPosition={context ? {top: context.y, left: context.x} : undefined}>
                    <MenuItem>
                        <label style={{cursor: 'pointer'}}>
                            {t('upload_file')}
                            <input type="file" hidden onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                    handleUpload(e.target.files[0]);
                                    setContext(null);
                                }
                            }}/>
                        </label>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setShowCreate(true);
                        setContext(null);
                    }}>{t('create_folder')}</MenuItem>
                </Menu>

                <MoveDialog
                    files={selected}
                    open={showMove}
                    onMoved={tid => setFolderCached(tid, undefined as any)}
                    onClose={() => {
                        setShowMove(false);
                        setSelected([]);
                        setFolderCached(folderId, undefined as any);
                        setAllFilesCached(undefined as any);
                        setFavoriteFilesCached(undefined as any);
                        load();
                    }}
                />
                <ShareDialog file={showShare} open={!!showShare} onClose={() => setShowShare(null)}/>

                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>{t('delete')}</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>{t('cancel')}</Button>
                        <Button color="error" onClick={async () => {
                            await deleteSelected();
                            setConfirmOpen(false);
                        }}>{t('delete')}</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
                    <DialogTitle sx={{textAlign: 'center', pb: .4, opacity: '80%'}}>{t('create_folder')}</DialogTitle>
                    <DialogContent sx={{pb: 0, px: 1.4}}>
                        <TextField
                            value={newFolderName}
                            size={'small'}
                            fullWidth sx={{mt: 1}}
                            label={t('folder_name')}
                            onChange={e => setNewFolderName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{pb: 2, px: 1.3}}>
                        <Button onClick={() => setShowCreate(false)}>{t('cancel')}</Button>
                        <Button onClick={handleCreateFolder}>{t('create_folder')}</Button>
                    </DialogActions>
                </Dialog>

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
