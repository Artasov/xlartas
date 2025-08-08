// Modules/FileHost/FavoriteFiles.tsx
import React, {useEffect, useState} from 'react';
import PaginatedList from 'Core/components/elements/PaginatedList';
import FileTableRow from './FileTableRow';
import {IFile} from './types';
import useFileUpload from './useFileUpload';
import UploadProgressWindow from './UploadProgressWindow';
import MoveDialog from './MoveDialog';
import ShareDialog from './ShareDialog';
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useMediaQuery
} from '@mui/material';
import {FRSE} from 'wide-containers';
import DropOverlay from './DropOverlay';
import {useTranslation} from 'react-i18next';
import {getFavoriteFilesCached, setFavoriteFilesCached} from './storageCache';
import {useFileHostApi} from "Modules/FileHost/useFileHostApi";

const FavoriteFiles: React.FC = () => {
    const {getFavoriteFiles, bulkDelete} = useFileHostApi();
    const {handleUpload, uploads, clearUploads} = useFileUpload(null, () => setFavoriteFilesCached(undefined as any));
    const {t} = useTranslation();
    const isGtSm = useMediaQuery('(min-width: 576px)');

    const [selected, setSelected] = useState<IFile[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const [showShare, setShowShare] = useState<IFile | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [trigger, setTrigger] = useState(0);

    const load = async (page: number): Promise<IFile[]> => {
        if (page === 1) {
            const cached = getFavoriteFilesCached();
            if (cached) return cached;
        }
        const data = await getFavoriteFiles(page, 20);
        if (page === 1) setFavoriteFilesCached(data);
        return data;
    };

    const toggleSelect = (f: IFile) => {
        setSelected(prev => prev.find(x => x.id === f.id) ? prev.filter(x => x.id !== f.id) : [...prev, f]);
    };

    useEffect(() => {
        if (selected.length === 0) setSelectMode(false);
    }, [selected]);

    const deleteSelected = async () => {
        await bulkDelete(selected.map(s => s.id));
        setSelected([]);
        setFavoriteFilesCached(undefined as any);
        setTrigger(t => t + 1);
    };

    return (
        <>
            <DropOverlay onFileDrop={handleUpload}/>
            <div onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]).then();
            }}>
                {selectMode && (
                    <FRSE g={1} mb={1}>
                        <Button onClick={() => setShowMove(true)}>Move</Button>
                        <Button color="error" onClick={() => setConfirmOpen(true)}>Delete</Button>
                    </FRSE>
                )}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{p: 0}}> </TableCell>
                            <TableCell sx={{pl: 0}}>{t('name')}</TableCell>
                            {isGtSm && <TableCell>{t('upload_date')}</TableCell>}
                            {isGtSm && <TableCell>{t('size')}</TableCell>}
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
                                onSelectMode={(f) => {
                                    setSelectMode(true);
                                    toggleSelect(f);
                                }}
                                onDelete={() => {
                                    setSelected([item]);
                                    setConfirmOpen(true);
                                }}
                                onDownload={f => window.open(f.file)}
                                onShare={() => setShowShare(item)}
                            />
                        )}
                        resetTrigger={trigger}
                    />
                </Table>
                <MoveDialog files={selected} open={showMove} onClose={() => {
                    setShowMove(false);
                    setSelected([]);
                    setTrigger(t => t + 1);
                }}/>
                <ShareDialog file={showShare} open={!!showShare} onClose={() => setShowShare(null)}/>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Delete?</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color="error" onClick={async () => {
                            await deleteSelected();
                            setConfirmOpen(false);
                        }}>Delete</Button>
                    </DialogActions>
                </Dialog>
                {uploads.length > 0 && (
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

export default FavoriteFiles;
