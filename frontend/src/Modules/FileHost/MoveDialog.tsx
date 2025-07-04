import React, {useEffect, useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select} from '@mui/material';
import {useApi} from '../Api/useApi';
import {useTranslation} from 'react-i18next';
import {IFile, IFolder} from './types';

interface Props {
    files: IFile[];
    open: boolean;
    onClose: () => void;
    onMoved?: (folderId: number) => void;
}

const MoveDialog: React.FC<Props> = ({files, open, onClose, onMoved}) => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [folders, setFolders] = useState<IFolder[]>([]);
    const [target, setTarget] = useState<number | ''>('');

    useEffect(() => {
        if (open) {
            api.get('/api/v1/filehost/folders/').then(setFolders);
        }
    }, [open]);

    const handleMove = async () => {
        if (!target) return;
        for (const f of files) {
            await api.post('/api/v1/filehost/item/move/', {item_id: f.id, new_folder_id: target});
        }
        onMoved && onMoved(target as number);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('move')}</DialogTitle>
            <DialogContent>
                <Select fullWidth value={target} onChange={e=>setTarget(Number(e.target.value))}>
                    {folders.map(f=>(<MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>))}
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
