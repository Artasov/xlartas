import React, {useEffect, useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Checkbox, FormControlLabel, IconButton} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
    const [publicAccess, setPublicAccess] = useState<any|null>(null);
    const handleAddEmail = () => {
        if (email && !emails.includes(email)) {
            setEmails([...emails, email]);
            setEmail('');
        }
    };
    const handleDeleteEmail = (e: string) => setEmails(emails.filter(x => x !== e));

    useEffect(() => {
        if (open && file) {
            api.get(`/api/v1/filehost/access/list/?file_id=${file.id}`).then((d: any[]) => {
                const pub = d.find(a => a.is_public);
                setPublicAccess(pub || null);
                setIsPublic(!!pub);
            });
        }
    }, [open, file]);

    const handleShare = async () => {
        if (!file) return;
        if (isPublic && !publicAccess) {
            const res = await api.post('/api/v1/filehost/access/grant/', {file_id: file.id, is_public: true});
            setPublicAccess(res);
        }
        for (const em of emails) {
            await api.post('/api/v1/filehost/access/grant/', {file_id: file.id, email: em});
        }
        onClose();
        setEmails([]);
    };

    const handlePublicChange = async (checked: boolean) => {
        setIsPublic(checked);
        if (!file) return;
        if (checked) {
            const res = await api.post('/api/v1/filehost/access/grant/', {file_id: file.id, is_public: true});
            setPublicAccess(res);
        } else if (publicAccess) {
            await api.delete('/api/v1/filehost/access/revoke/', {data:{access_id: publicAccess.id}});
            setPublicAccess(null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('share')}</DialogTitle>
            <DialogContent>
                <FormControlLabel control={<Checkbox checked={isPublic} onChange={e=>handlePublicChange(e.target.checked)}/>} label="Public" />
                {publicAccess && (
                    <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
                        <TextField fullWidth value={`${window.location.origin}/public/${publicAccess.public_link}`} InputProps={{readOnly:true}}/>
                        <IconButton onClick={()=>navigator.clipboard.writeText(`${window.location.origin}/public/${publicAccess.public_link}`)}>
                            <ContentCopyIcon fontSize="small"/>
                        </IconButton>
                    </div>
                )}
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
