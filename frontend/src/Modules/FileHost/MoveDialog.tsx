// Modules/FileHost/MoveDialog.tsx
import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select} from '@mui/material';
import {useFileHostApi} from 'FileHost/useFileHostApi';
import {useTranslation} from 'react-i18next';
import {IFile, IFolder} from './types';

interface Props {
    files: IFile[];
    open: boolean;
    onClose: () => void;
    onMoved?: (folderId: number) => void;
}

const MoveDialog: React.FC<Props> = ({files, open, onClose, onMoved}) => {
    const {getFolders, moveItem} = useFileHostApi();
    const {t} = useTranslation();
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [target, setTarget] = useState<number | ''>('');

    useEffect(() => {
        if (open) {
            getFolders().then(setFolders);
        }
    }, [open, getFolders]);

    const handleMove = async () => {
        if (!target) return;
        for (const f of files) {
            await moveItem(f.id, target as number);
        }
        onMoved && onMoved(target as number);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('move')}</DialogTitle>
            <DialogContent>
                <Select fullWidth value={target} onChange={e => setTarget(Number(e.target.value))}>
                    {folders.map(f => (<MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>))}
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleMove}>{t('move')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MoveDialog;
