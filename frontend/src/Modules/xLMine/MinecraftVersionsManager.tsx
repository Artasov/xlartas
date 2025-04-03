import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
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
import {FC, FRSC} from "WideLayout/Layouts";
import FileUpload from "../../UI/FileUpload";

interface VersionItem {
    id: number;
    file: string;
    version: string;
    sha256_hash: string;
}

const LauncherManager: React.FC = () => {
    const {api} = useApi();
    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/v1/xlmine/launcher/');
            setVersions(data.results);
        } catch (error) {
            Message.error('Ошибка загрузки версий лаунчера');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, []);

    const handleFileSelect = (file: File | null) => {
        if (file) setFile(file);
    };

    const handleUpload = async () => {
        if (!file) {
            Message.error('Выберите файл');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        setUploadProgress(0);
        try {
            await api.post('/api/v1/xlmine/launcher/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            Message.success('Новая версия лаунчера загружена');
            setFile(null);
            setFileReset(true);
            // Сброс reset-флага после рендера
            setTimeout(() => setFileReset(false), 0);
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка загрузки файла');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить версию?')) return;
        try {
            await api.delete(`/api/v1/xlmine/launcher/${id}/`);
            Message.success('Версия удалена');
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка удаления версии');
        }
    };

    return (
        <FC g={1}>
            <Paper sx={{p: 2}}>
                <FC g={1}>
                    <FRSC g={2}>
                        <FileUpload onFileSelect={handleFileSelect} reset={fileReset}/>
                        <Button variant="contained" onClick={handleUpload} disabled={!file}
                                sx={{fontWeight: file ? 'bold' : ''}}>
                            {uploadProgress > 0 && uploadProgress < 100 ? (
                                <CircularProgress size={24} sx={{mr: 1, color: 'inherit'}}/>
                            ) : null}
                            Загрузить
                        </Button>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <LinearProgress variant="determinate" value={uploadProgress} sx={{mt: 2}}/>
                        )}
                    </FRSC>
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
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {versions.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.version}</TableCell>
                                    <TableCell style={{wordBreak: 'break-all'}}>{item.sha256_hash}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDelete(item.id)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </FC>
    );
};

const ReleaseManager: React.FC = () => {
    const {api} = useApi();
    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/v1/xlmine/release/');
            setVersions(data.results);
        } catch (error) {
            Message.error('Ошибка загрузки версий релиза');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, []);

    const handleFileChange = (file: File | null) => {
        if (file) setFile(file);
    };

    const handleUpload = async () => {
        if (!file) {
            Message.error('Выберите файл');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        setUploadProgress(0);
        try {
            await api.post('/api/v1/xlmine/release/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            Message.success('Новая версия релиза загружена');
            setFile(null);
            setFileReset(true);
            setTimeout(() => setFileReset(false), 0);
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка загрузки файла');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить версию?')) return;
        try {
            await api.delete(`/api/v1/xlmine/release/${id}/`);
            Message.success('Версия удалена');
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка удаления версии');
        }
    };

    return (
        <FC g={1}>
            <Paper sx={{p: 2}}>
                <FC g={1}>
                    <FRSC g={2}>
                        <FileUpload onFileSelect={handleFileChange} reset={fileReset}/>
                        <Button variant="contained" sx={{fontWeight: file ? 'bold' : ''}}
                                onClick={handleUpload} disabled={!file}>
                            {uploadProgress > 0 && uploadProgress < 100 ? (
                                <CircularProgress size={24} sx={{mr: 1, color: 'inherit'}}/>
                            ) : null}
                            Загрузить
                        </Button>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <LinearProgress variant="determinate" value={uploadProgress}/>
                        )}
                    </FRSC>
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
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {versions.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.version}</TableCell>
                                    <TableCell style={{wordBreak: 'break-all'}}>{item.sha256_hash}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDelete(item.id)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </FC>
    );
};

const MinecraftVersionsManager: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
