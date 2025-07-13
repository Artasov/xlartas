// Modules/FileHost/ShareDialog.tsx
import React, {useEffect, useState} from 'react';
import {
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useApi} from 'Api/useApi';
import {useTranslation} from 'react-i18next';
import {IFile} from './types';
import {FR, FRSC} from "wide-containers";

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
    const [publicAccess, setPublicAccess] = useState<any | null>(null);
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
            await api.delete('/api/v1/filehost/access/revoke/', {data: {access_id: publicAccess.id}});
            setPublicAccess(null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth slotProps={{
            paper: {
                sx: {width: '100%', maxWidth: 400},
            }
        }}>
            <DialogTitle sx={{pb: 1}}>
                {t('share')}
            </DialogTitle>
            <DialogContent sx={{pb: 0}}>
                <Typography>{file?.name}</Typography>
                <FormControlLabel
                    control={<Checkbox sx={{p: .6, ml: .36}}
                                       checked={isPublic}
                                       onChange={e => handlePublicChange(e.target.checked)}
                    />} label={'Public'}
                />
                {publicAccess && (
                    <FRSC mb={0} g={.6}>
                        <TextField
                            fullWidth value={`${window.location.origin}/public/${publicAccess.public_link}`}
                            slotProps={{input: {readOnly: true}}} size={'small'}
                        />
                        <IconButton onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/public/${publicAccess.public_link}`)
                        }} sx={{p: 1}}>
                            <ContentCopyIcon fontSize={'small'}/>
                        </IconButton>
                    </FRSC>
                )}
                <TextField
                    fullWidth label={'Email'} size={'small'} sx={{mt: 1}}
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEmail();
                        }
                    }}
                />
                {emails.length > 0 && <FR wrap g={2} mt={1}>
                    {emails.map(e => (<Chip key={e} label={e} onDelete={() => handleDeleteEmail(e)}/>))}
                </FR>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleShare}>{t('share')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareDialog;
