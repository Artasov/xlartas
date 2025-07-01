import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Checkbox, FormControlLabel} from '@mui/material';
import {useApi} from '../Api/useApi';
import {useTranslation} from 'react-i18next';
import {IFile} from './types';

interface Props {
    file: IFile | null;
    open: boolean;
    onClose: () => void;
}

const ShareDialog: React.FC<Props> = ({file, open, onClose}) => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [emails, setEmails] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const handleAddEmail = () => {
        if (email && !emails.includes(email)) {
            setEmails([...emails, email]);
            setEmail('');
        }
    };
    const handleDeleteEmail = (e: string) => setEmails(emails.filter(x => x !== e));

    const handleShare = async () => {
        if (!file) return;
        if (isPublic) await api.post('/api/v1/filehost/access/grant/', {file_id: file.id, is_public: true});
        for (const em of emails) {
            await api.post('/api/v1/filehost/access/grant/', {file_id: file.id, email: em});
        }
        onClose();
        setEmails([]);
        setIsPublic(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('share')}</DialogTitle>
            <DialogContent>
                <FormControlLabel control={<Checkbox checked={isPublic} onChange={e=>setIsPublic(e.target.checked)}/>} label="Public" />
                <TextField fullWidth label="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();handleAddEmail();}}} />
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
                    {emails.map(e=>(<Chip key={e} label={e} onDelete={()=>handleDeleteEmail(e)}/>))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleShare}>{t('share')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareDialog;
