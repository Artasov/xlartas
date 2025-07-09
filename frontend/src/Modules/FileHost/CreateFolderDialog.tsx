import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface Props {
    open: boolean;
    value: string;
    onChange: (v: string) => void;
    onCreate: () => void;
    onClose: () => void;
}

const CreateFolderDialog: React.FC<Props> = ({open, value, onChange, onCreate, onClose}) => {
    const {t} = useTranslation();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{textAlign: 'center', pb: .4, opacity: '80%'}}>{t('create_folder')}</DialogTitle>
            <DialogContent sx={{pb: 0, px: 1.4}}>
                <TextField
                    value={value}
                    size={'small'}
                    fullWidth sx={{mt: 1}}
                    label={t('folder_name')}
                    onChange={e => onChange(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{pb: 2, px: 1.3}}>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={onCreate}>{t('create_folder')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateFolderDialog;
