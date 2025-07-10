import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {useApi} from 'Api/useApi';
import {useTranslation} from 'react-i18next';

interface Props {
    id: number | null;
    name: string;
    open: boolean;
    onClose: () => void;
    onRenamed?: () => void;
}

const RenameDialog: React.FC<Props> = ({id, name, open, onClose, onRenamed}) => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [value, setValue] = useState(name);

    useEffect(() => {
        setValue(name);
    }, [name]);

    const handleRename = async () => {
        if (!id) return;
        await api.post('/api/v1/filehost/item/rename/', {item_id: id, new_name: value});
        onClose();
        onRenamed && onRenamed();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('rename')}</DialogTitle>
            <DialogContent>
                <TextField fullWidth value={value} onChange={e => setValue(e.target.value)}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleRename}>{t('save')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RenameDialog;
