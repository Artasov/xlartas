// Modules/xLMine/ReleaseManager.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {Message} from 'Core/components/Message';
import DeleteIcon from '@mui/icons-material/Delete';
import {useApi} from "Api/useApi";
import {FC, FCS, FR, FRC} from "wide-containers";
import FileUpload from "../../UI/FileUpload";
import {IRelease} from "./types/base";
import {v4 as uuidv4} from 'uuid';
import TextField from "@mui/material/TextField";
import Collapse from '@mui/material/Collapse';

const CHUNK_SIZE = 50 * 1024 * 1024;

const ReleaseManager: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();

    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [securityJson, setSecurityJson] = useState<string>('');
    const [securityValid, setSecurityValid] = useState<boolean>(false);

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [version, setVersion] = useState<string>("1.0.0");
    const [releases, setReleases] = useState<IRelease[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [animate, setAnimate] = useState(false);

    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const {results} = await api.get('/api/v1/xlmine/release/');
            setReleases(results);
        } catch {
            Message.error(t('release_versions_load_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions().then();
    }, []);

    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    const handleFileChange = (picked: File | null) => {
        setFile(picked);
        setSecurityJson('');
        setSecurityValid(false);
    };

    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSecurityJson(val);
        try {
            const parsed = JSON.parse(val);
            setSecurityValid(!!parsed && typeof parsed === 'object');
        } catch {
            setSecurityValid(false);
        }
    };

    const handleUpload = async () => {
        if (!file || !securityValid) {
            Message.error(t('select_file_and_json'));
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const uploadId = uuidv4();
            let response: any = null;

            for (let idx = 0; idx < totalChunks; idx++) {
                const start = idx * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('upload_id', uploadId);
                formData.append('chunk_index', String(idx));
                formData.append('total_chunks', String(totalChunks));
                formData.append('filename', file.name);
                formData.append('file', chunk);
                formData.append('version', version);

                // Добавляем security_json только в первый чанк
                if (idx === 0) formData.append('security_json', securityJson);

                response = await api.post('/api/v1/xlmine/chunked-release/', formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });

                setUploadProgress(Math.round(((idx + 1) / totalChunks) * 100));
            }

            if (response && response.id) {
                setReleases(prev => [...prev, response]);
                Message.success(t('release_version_uploaded'));
                setFile(null);
                setFileReset(true);
                setTimeout(() => setFileReset(false), 0);
                setSecurityJson('');
                setSecurityValid(false);
            } else {
                Message.error(t('file_upload_error'));
            }
        } catch {
            Message.error(t('file_upload_error'));
        }

        setIsUploading(false);
        setUploadProgress(0);
    };

    const openConfirmDelete = (id: number) => setConfirmDeleteId(id);
    const closeConfirmDelete = () => setConfirmDeleteId(null);

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        try {
            await api.delete(`/api/v1/xlmine/release/${confirmDeleteId}/`);
            setReleases(prev => prev.filter(r => r.id !== confirmDeleteId));
            Message.success(t('version_deleted'));
        } catch {
            Message.error(t('version_delete_error'));
        } finally {
            setConfirmDeleteId(null);
            setDeletingId(null);
        }
    };

    return (
        <Collapse in={animate} appear timeout={400}>
            <FC g={1}>
                <Paper sx={{p: 2}}>
                    <FC g={1}>
                        <FCS g={1}>
                            <FR g={1}>
                                <FileUpload onFileSelect={handleFileChange} reset={fileReset}/>
                                <TextField
                                    sx={{width: 'fit-content'}}
                                    size={'small'}
                                    label="Версия"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}  // Редактируем версию
                                />
                            </FR>
                            {file && (
                                <TextField
                                    label="security.json"
                                    value={securityJson}
                                    onChange={handleSecurityChange}
                                    multiline
                                    minRows={4}
                                    maxRows={10}
                                    sx={{flexGrow: 1, width: '100%', m: 0}}
                                    placeholder="Вставьте содержимое security.json"
                                    error={!!securityJson && !securityValid}
                                    helperText={!securityValid && securityJson ? 'Некорректный JSON' : null}
                                />
                            )}
                            <FR>
                                <Button
                                    sx={{fontWeight: file ? 'bold' : '', px: 3}}
                                    onClick={handleUpload}
                                    disabled={!file || !securityValid || isUploading}
                                >
                                    {t('upload')}
                                </Button>
                            </FR>
                            {isUploading && (
                                <FC flexGrow={1} g={0.8}>
                                    <LinearProgress
                                        sx={{height: 10, borderRadius: '4px'}}
                                        variant="determinate"
                                        value={uploadProgress}
                                    />
                                    <FRC fontSize=".8rem" lineHeight=".7rem">
                                        {uploadProgress}% загружено
                                    </FRC>
                                </FC>
                            )}
                        </FCS>
                    </FC>
                </Paper>

                <Paper sx={{p: 2, pt: 1}}>
                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                            <CircularProgressZoomify in/>
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>{t('version')}</TableCell>
                                    <TableCell>SHA256</TableCell>
                                    <TableCell>{t('creation_date')}</TableCell>
                                    <TableCell>{t('actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {releases.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.id}</TableCell>
                                        <TableCell>{r.version}</TableCell>
                                        <TableCell style={{wordBreak: 'break-all'}}>{r.sha256_hash}</TableCell>
                                        <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => openConfirmDelete(r.id)}
                                                        disabled={deletingId === r.id}>
                                                {deletingId === r.id ? <CircularProgressZoomify in size={24}/> :
                                                    <DeleteIcon/>}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Paper>

                <Dialog open={!!confirmDeleteId} onClose={closeConfirmDelete}>
                    <DialogTitle>Удаление релиза</DialogTitle>
                    <DialogContent>Вы уверены, что хотите удалить версию?</DialogContent>
                    <DialogActions>
                        <Button onClick={closeConfirmDelete}>Отмена</Button>
                        <Button onClick={handleConfirmDelete} disabled={deletingId === confirmDeleteId}>
                            {deletingId === confirmDeleteId ? <CircularProgressZoomify in size={24}/> : 'Удалить'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </FC>
        </Collapse>
    );
};

export default ReleaseManager;
