import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
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

interface VersionItem {
    id: number;
    file: string;
    version: string;
    sha256_hash: string;
}

const LauncherManager: React.FC = () => {
    const {api} = useApi();
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchVersions = async () => {
        try {
            const data = await api.get('/api/v1/launcher/');
            setVersions(data);
        } catch (error) {
            Message.error('Ошибка загрузки версий лаунчера');
        }
    };

    useEffect(() => {
        fetchVersions();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
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
            await api.post('/api/v1/launcher/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            Message.success('Новая версия лаунчера загружена');
            setFile(null);
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка загрузки файла');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить версию?')) return;
        try {
            await api.delete(`/api/v1/launcher/${id}/`);
            Message.success('Версия удалена');
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка удаления версии');
        }
    };

    return (
        <Box>
            <Paper sx={{p: 2, mb: 2}}>
                <h2>Создать новую версию лаунчера</h2>
                <input type="file" onChange={handleFileChange}/>
                <Button variant="contained" onClick={handleUpload} disabled={!file} sx={{mt: 1}}>
                    Загрузить
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{mt: 2}}/>
                )}
            </Paper>
            <Paper sx={{p: 2}}>
                <h2>Список версий лаунчера</h2>
                {loading ? (
                    <LinearProgress/>
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
                                    <TableCell>{item.sha256_hash}</TableCell>
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
        </Box>
    );
};

const ReleaseManager: React.FC = () => {
    const {api} = useApi();
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchVersions = async () => {
        try {
            const data = await api.get('/api/v1/release/');
            setVersions(data);
        } catch (error) {
            Message.error('Ошибка загрузки версий релиза');
        }
    };

    useEffect(() => {
        fetchVersions();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
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
            await api.post('/api/v1/release/', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            Message.success('Новая версия релиза загружена');
            setFile(null);
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка загрузки файла');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить версию?')) return;
        try {
            await api.delete(`/api/v1/release/${id}/`);
            Message.success('Версия удалена');
            fetchVersions();
        } catch (error) {
            Message.error('Ошибка удаления версии');
        }
    };

    return (
        <Box>
            <Paper sx={{p: 2, mb: 2}}>
                <h2>Создать новую версию релиза</h2>
                <input type="file" onChange={handleFileChange}/>
                <Button variant="contained" onClick={handleUpload} disabled={!file} sx={{mt: 1}}>
                    Загрузить
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{mt: 2}}/>
                )}
            </Paper>
            <Paper sx={{p: 2}}>
                <h2>Список версий релиза</h2>
                {loading ? (
                    <LinearProgress/>
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
                                    <TableCell>{item.sha256_hash}</TableCell>
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
        </Box>
    );
};

const MinecraftVersionsManager: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box sx={{width: '100%', p: 2}}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Launcher версии"/>
                <Tab label="Release версии"/>
            </Tabs>
            <Box sx={{mt: 2}}>
                {tabIndex === 0 && <LauncherManager/>}
                {tabIndex === 1 && <ReleaseManager/>}
            </Box>
        </Box>
    );
};

export default MinecraftVersionsManager;
