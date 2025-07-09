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
import {useApi} from "../Api/useApi";
import {FC, FCCC, FRSC} from "wide-containers";
import FileUpload from "../../UI/FileUpload";
import {ILauncher} from "./types/base";
import TextField from "@mui/material/TextField";
import Collapse from '@mui/material/Collapse';

const LauncherManager: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();

    // ==== Состояния ====
    const [file, setFile] = useState<File | null>(null);
    const [fileReset, setFileReset] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [launchers, setLaunchers] = useState<ILauncher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [version, setVersion] = useState<string>("1.0.0");
    const [animate, setAnimate] = useState(false);
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
            Message.error(t('launcher_versions_load_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions().then();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    // ==== Выбор файла ====
    const handleFileSelect = (picked: File | null) => {
        setFile(picked);
    };

    // ==== Загрузка файла ====
    const handleUpload = async () => {
        if (!file) {
            Message.error(t('select_installer_file'));
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

            Message.success(t('launcher_version_uploaded'));
        } catch (error) {
            Message.error(t('file_upload_error'));
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
            Message.success(t('version_deleted'));
            setLaunchers(prev => prev.filter(item => item.id !== confirmDeleteId));
        } catch (error) {
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
                        <FC g={1}>
                            <FRSC g={1}>
                                <span>{t('installer')}</span>
                                <FileUpload onFileSelect={handleFileSelect} reset={fileReset}/>
                            </FRSC>
                            <TextField
                                sx={{width: 'fit-content'}}
                                size={'small'}
                                label={t('version')}
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}  // Редактируем версию
                                fullWidth
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={!file}
                                sx={{fontWeight: file ? 'bold' : ''}}
                            >
                                {t('upload')}
                            </Button>
                            {isUploading && <FCCC><CircularProgressZoomify in size={32}/></FCCC>}
                        </FC>
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
                                                    <CircularProgressZoomify in size={24}/>
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
                                <CircularProgressZoomify in size={24}/>
                            ) : (
                                'Удалить'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            </FC>
        </Collapse>
    );
};

const formatDate = (isoDate: string) => {
    try {
        return new Date(isoDate).toLocaleString();
    } catch {
        return isoDate;
    }
};

export default LauncherManager;
