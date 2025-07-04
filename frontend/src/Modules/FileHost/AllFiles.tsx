import React, {useEffect, useState} from 'react';
import PaginatedList from 'Core/components/elements/PaginatedList';
import {useApi} from '../Api/useApi';
import FileTableRow from './FileTableRow';
import {IFile} from './types';
import useFileUpload from './useFileUpload';
import UploadProgressWindow from './UploadProgressWindow';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import {Button, Dialog, DialogActions, DialogTitle, Table, TableHead, TableBody, TableRow, TableCell, useMediaQuery} from '@mui/material';
import {FR, FRC, FRSE} from 'wide-containers';
import DropOverlay from './DropOverlay';
import {useTranslation} from 'react-i18next';
import {getAllFilesCached, setAllFilesCached} from './storageCache';

const AllFiles: React.FC = () => {
    const {api} = useApi();
    const {handleUpload, uploads, clearUploads} = useFileUpload(null, () => setAllFilesCached(undefined as any));
    const {t} = useTranslation();

    const [selected, setSelected] = useState<IFile[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    const load = async (page: number): Promise<IFile[]> => {
        if (page === 1) {
            const cached = getAllFilesCached();
            if (cached) return cached;
        }
        const data = await api.get(`/api/v1/filehost/files/?page=${page}&page_size=20`);
        if (page === 1) setAllFilesCached(data);
        return data;
    };

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x => x.id === f.id) ? prev.filter(x => x.id !== f.id) : [...prev, f]);
    };

    useEffect(() => { if (selected.length === 0) setSelectMode(false); }, [selected]);

    const deleteSelected = async () => {
        await api.post('/api/v1/filehost/items/bulk_delete/', {file_ids: selected.map(s => s.id)});
        setSelected([]);
        setAllFilesCached(undefined as any);
        setTrigger(t => t + 1);
    };

    return (
        <>
        <DropOverlay onFileDrop={handleUpload}/>
        <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);}}>
            {selectMode && (
                <FRSE g={1} mb={1}>
                    <Button onClick={() => setShowMove(true)}>Move</Button>
                    <Button color="error" onClick={() => setConfirmOpen(true)}>Delete</Button>
                </FRSE>
            )}
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {selectMode && <TableCell padding="checkbox"/>}
                        <TableCell>{t('name')}</TableCell>
                        {isGtSm && <TableCell>{t('upload_date')}</TableCell>}
                        <TableCell>{t('size')}</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <PaginatedList
                    loadData={load}
                    component={TableBody}
                    renderItem={(item) => (
                        <FileTableRow
                            key={item.id}
                            file={item}
                            selectMode={selectMode}
                            selected={!!selected.find(s => s.id === item.id)}
                            onToggleSelect={toggleSelect}
                            onSelectMode={(f)=>{setSelectMode(true); toggleSelect(f);}}
                            onDelete={()=>{setSelected([item]); setConfirmOpen(true);}}
                            onDownload={f=>window.open(f.file)}
                            onShare={()=>setShowShare(item)}
                        />
                    )}
                    resetTrigger={trigger}
                />
            </Table>
            <MoveDialog files={selected} open={showMove} onClose={()=>{setShowMove(false); setSelected([]); setTrigger(t=>t+1);}}/>
            <ShareDialog file={showShare} open={!!showShare} onClose={()=>setShowShare(null)}/>
            <Dialog open={confirmOpen} onClose={()=>setConfirmOpen(false)}>
                <DialogTitle>Delete?</DialogTitle>
                <DialogActions>
                    <Button onClick={()=>setConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={async()=>{await deleteSelected(); setConfirmOpen(false);}}>Delete</Button>
                </DialogActions>
            </Dialog>
            {uploads.length>0 && (
                <UploadProgressWindow
                    items={uploads}
                    onClose={clearUploads}
                    onShare={f => setShowShare(f)}
                />
            )}
        </div>
        </>
    );
};

export default AllFiles;
