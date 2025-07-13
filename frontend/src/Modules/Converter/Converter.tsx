import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Snackbar
} from '@mui/material';
import MuiAlert, {AlertProps} from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
import FileDropZone from 'UI/FileDropZone';
import FormatPicker from './FormatPicker';
import ParameterForm from './ParameterForm';
import {IConversion, IFormat, IParameter} from 'types/converter';
import {FC, FR} from "wide-containers";
import ConverterGuide from './ConverterGuide';

const Converter: React.FC = () => {
    const [source, setSource] = useState<IFormat | null>(null);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [targets, setTargets] = useState<IFormat[]>([]);
    const [params, setParams] = useState<IParameter[]>([]);
    const [values, setValues] = useState<Record<string, any>>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [conversion, setConversion] = useState<IConversion | null>(null);
    const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
    const [formats, setFormats] = useState<IFormat[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('/api/v1/converter/formats/').then(r => setFormats(r.data));
    }, []);

    useEffect(() => {
        if (!source) return;
        axios.get(`/api/v1/converter/formats/${source.id}/variants/`)
            .then(r => setTargets(r.data));
        axios.get(`/api/v1/converter/formats/${source.id}/parameters/`)
            .then(r => setParams(r.data));
    }, [source]);

    useEffect(() => {
        if (!file || formats.length === 0) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const fmt = formats.find(f => f.name.toLowerCase() === ext);
        if (fmt) {
            setSource(fmt);
        } else {
            setError(`Неизвестный формат файла${ext ? ` (.${ext})` : ''}`);
            setFile(null);
            setSource(null);
        }
    }, [file, formats]);

    const pollStatus = (id: number) => {
        const t = setInterval(() => {
            axios.get(`/api/v1/converter/conversion/${id}/`)
                .then(r => {
                    setConversion(r.data);
                    if (r.data.is_done) {
                        clearInterval(t);
                        setTimer(null);
                        setLoading(false);
                    }
                });
        }, 2000);
        setTimer(t);
    };

    /* ---------- 🧹 Очищаем таймер при демонтировании ---------- */
    useEffect(() => () => {
        if (timer) clearInterval(timer);
    }, [timer]);

    const handleConvert = () => {
        if (!file || !source || !targetId) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_format', String(source.id));
        formData.append('target_format', String(targetId));
        formData.append('params', JSON.stringify(values));
        setLoading(true);
        axios.post('/api/v1/converter/convert/', formData)
            .then(r => {
                setConversion(r.data);
                pollStatus(r.data.id);
            })
            .catch(() => setLoading(false));
    };

    return (
        <FR wrap w={'100%'} px={2} maxW={600} mx={'auto'}>
            <ConverterGuide/>
            <FC grow>
                <FileDropZone file={file} onChange={setFile}/>
                {conversion && !conversion.is_done && (
                    <Box mt={2}><CircularProgress/></Box>
                )}

                {conversion?.is_done && conversion.output_file && (
                    <Box mt={2}>
                        <Typography>{conversion.output_file.split('/').pop()}</Typography>
                        {typeof conversion.size === 'number' && (
                            <Typography variant="caption">
                                {(conversion.size / 1024).toFixed(1)} KB
                            </Typography>
                        )}
                        <Box mt={1}>
                            <Button variant="contained"
                                    href={conversion.output_file}
                                    download>
                                Download
                            </Button>
                        </Box>
                    </Box>
                )}
            </FC>

            {/* Правая колонка: выбор форматов и параметров */}
            {file && (
                <FC>
                    {source && (
                        <>
                            <Box mt={2}>
                                <Typography>Формат: {source.name}</Typography>
                            </Box>
                            <Box mt={2}>
                                <FormatPicker
                                    formats={targets}
                                    value={targetId ?? undefined}
                                    onChange={setTargetId}
                                />
                            </Box>

                            {params.length > 0 && (
                                <ParameterForm
                                    parameters={params}
                                    values={values}
                                    onChange={(n, v) => setValues(prev => ({...prev, [n]: v}))}
                                />
                            )}

                            <Box mt={2}>
                                <Button
                                    variant="contained"
                                    disabled={loading}
                                    onClick={handleConvert}
                                >
                                    {loading ? <CircularProgress size={24}/> : 'Convert'}
                                </Button>
                            </Box>
                        </>
                    )}
                </FC>
            )}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={(_e, r) => {
                if (r === 'clickaway') return;
                setError(null);
            }}>
                <Alert onClose={() => setError(null)} severity="error" sx={{width: '100%'}}>
                    {error}
                </Alert>
            </Snackbar>
        </FR>
    );
};

export default Converter;
