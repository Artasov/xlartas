// Modules/FileHost/ConfirmDeleteDialog.tsx
import React from 'react';
import {Button, Dialog, DialogActions, DialogTitle} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface Props {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmDeleteDialog: React.FC<Props> = ({open, onCancel, onConfirm}) => {
    const {t} = useTranslation();
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{t('delete')}</DialogTitle>
            <DialogActions>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button color="error" onClick={onConfirm}>{t('delete')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;
