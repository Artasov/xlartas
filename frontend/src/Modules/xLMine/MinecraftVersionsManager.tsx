// Modules/xLMine/MinecraftVersionsManager.tsx
import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs
} from '@mui/material';
import {Message} from 'Core/components/Message';
import DeleteIcon from '@mui/icons-material/Delete';
import {useApi} from "../Api/useApi";
import Button from "Core/components/elements/Button/Button";
import {FC, FCCC, FCS, FR, FRC, FRSC} from "WideLayout/Layouts";
import FileUpload from "../../UI/FileUpload";
import {ILauncher, IRelease} from "./types/base";
import {v4 as uuidv4} from 'uuid';
import TextField from "@mui/material/TextField";

// ==== Форматирование даты (если хочешь как есть — можно убрать toLocaleString) ====


const LauncherManager: React.FC = () => {
    const {api} = useApi();

    // ==== Состояния ====
    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [launchers, setLaunchers] = useState<ILauncher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [version, setVersion] = useState<string>("1.0.0");
    // Удаление
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ==== Загрузка начального списка ====
    const fetchVersions = async () => {
        setLoading(true);
        try {
            const {results} = await api.get('/api/v1/xlmine/launcher/');
            setLaunchers(results);
        } catch (error) {
            Message.error('Ошибка загрузки версий лаунчера');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
        // eslint-disable-next-line
    }, []);

    // ==== Выбор файла ====
    const handleFileSelect = (picked: File | null) => {
        setFile(picked);
    };

    // ==== Загрузка файла ====
    const handleUpload = async () => {
        if (!file) {
            Message.error('Выберите файл установщика');
            return;
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('version', version);

            const newVersion = await api.post('/api/v1/xlmine/launcher/', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            });

            setLaunchers(prev => [...prev, newVersion]);

            // Сброс
            setFile(null);
            setFileReset(true);
            setTimeout(() => setFileReset(false), 0);

            Message.success('Новая версия лаунчера загружена');
        } catch (error) {
            Message.error('Ошибка загрузки файла');
        }
        setIsUploading(false);
    };

    // ==== Удаление ====
    const openConfirmDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    const closeConfirmDelete = () => {
        setConfirmDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        try {
            await api.delete(`/api/v1/xlmine/launcher/${confirmDeleteId}/`);
            Message.success('Версия удалена');
            setLaunchers(prev => prev.filter(item => item.id !== confirmDeleteId));
        } catch (error) {
            Message.error('Ошибка удаления версии');
        } finally {
            setConfirmDeleteId(null);
            setDeletingId(null);
        }
    };

    return (
        <FC g={1}>
            <Paper sx={{p: 2}}>
                <FC g={1}>
                    <FC g={1}>
                        <FRSC g={1}>
                            <span>Установщик</span>
                            <FileUpload onFileSelect={handleFileSelect} reset={fileReset}/>
                        </FRSC>
                        <TextField
                            sx={{width: 'fit-content'}}
                            size={'small'}
                            label="Версия"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}  // Редактируем версию
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!file}
                            sx={{fontWeight: file ? 'bold' : ''}}
                        >
                            Загрузить
                        </Button>
                        {isUploading && <FCCC><CircularProgress size={32}/></FCCC>}
                    </FC>
                </FC>
            </Paper>

            <Paper sx={{p: 2, pt: 1}}>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Версия</TableCell>
                                <TableCell>SHA256</TableCell>
                                <TableCell>Дата создания</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {launchers.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.version}</TableCell>
                                    <TableCell style={{wordBreak: 'break-all'}}>
                                        {item.sha256_hash}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(item.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => openConfirmDelete(item.id)}
                                            disabled={deletingId === item.id}
                                        >
                                            {deletingId === item.id ? (
                                                <CircularProgress size={24}/>
                                            ) : (
                                                <DeleteIcon/>
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {/* Подтверждение удаления */}
            <Dialog
                open={!!confirmDeleteId}
                onClose={closeConfirmDelete}
            >
                <DialogTitle>Удаление версии лаунчера</DialogTitle>
                <DialogContent>
                    Вы уверены, что хотите удалить версию?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDelete}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deletingId === confirmDeleteId}
                    >
                        {deletingId === confirmDeleteId ? (
                            <CircularProgress size={24}/>
                        ) : (
                            'Удалить'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </FC>
    );
};


const formatDate = (isoDate: string) => {
    try {
        return new Date(isoDate).toLocaleString();
    } catch {
        return isoDate;
    }
};

const CHUNK_SIZE = 50 * 1024 * 1024;

const ReleaseManager: React.FC = () => {
    const {api} = useApi();

    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [securityJson, setSecurityJson] = useState<string>('');
    const [securityValid, setSecurityValid] = useState<boolean>(false);

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [version, setVersion] = useState<string>("1.0.0");
    const [releases, setReleases] = useState<IRelease[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const {results} = await api.get('/api/v1/xlmine/release/');
            setReleases(results);
        } catch {
            Message.error('Ошибка загрузки версий релиза');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, []);

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
            Message.error('Выберите файл и вставьте корректный JSON');
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
                Message.success('Новая версия релиза загружена');
                setFile(null);
                setFileReset(true);
                setTimeout(() => setFileReset(false), 0);
                setSecurityJson('');
                setSecurityValid(false);
            } else {
                Message.error('Ошибка загрузки файла');
            }
        } catch {
            Message.error('Ошибка загрузки файла');
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
            Message.success('Версия удалена');
        } catch {
            Message.error('Ошибка удаления версии');
        } finally {
            setConfirmDeleteId(null);
            setDeletingId(null);
        }
    };

    return (
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
                                variant="contained"
                                sx={{fontWeight: file ? 'bold' : '', px: 3}}
                                onClick={handleUpload}
                                disabled={!file || !securityValid || isUploading}
                            >
                                Загрузить
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
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Версия</TableCell>
                                <TableCell>SHA256</TableCell>
                                <TableCell>Дата создания</TableCell>
                                <TableCell>Действия</TableCell>
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
                                            {deletingId === r.id ? <CircularProgress size={24}/> : <DeleteIcon/>}
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
                        {deletingId === confirmDeleteId ? <CircularProgress size={24}/> : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </FC>
    );
};


const MinecraftVersionsManager: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <FC>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Launcher"/>
                <Tab label="Release"/>
            </Tabs>
            <FC>
                {tabIndex === 0 && <LauncherManager/>}
                {tabIndex === 1 && <ReleaseManager/>}
            </FC>
        </FC>
    );
};

export default MinecraftVersionsManager;
