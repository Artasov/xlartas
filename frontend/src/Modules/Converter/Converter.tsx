import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Box, Button, CircularProgress, Typography} from '@mui/material';
import FileDropZone from 'UI/FileDropZone';
import FormatPicker from './FormatPicker';
import ParameterForm from './ParameterForm';
import {IConversion, IFormat, IParameter} from 'types/converter';
import {FC} from "wide-containers";
import ConverterGuide from './ConverterGuide';
import {Message} from 'Modules/Core/components/Message';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";


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
            Message.error(`Неизвестный формат файла${ext ? ` (.${ext})` : ''}`);
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
        <FC w={'100%'} px={2} maxW={600} mx={'auto'}>
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
            {file && source && (
                <FC g={1} mt={1}>
                    <FormatPicker
                        formats={targets}
                        value={targetId ?? undefined}
                        onChange={setTargetId}
                    />
                    <FC g={1} mt={1}>
                        {params.length > 0 && (
                            <ParameterForm
                                parameters={params}
                                values={values}
                                onChange={(n, v) => setValues(prev => ({...prev, [n]: v}))}
                            />
                        )}
                    </FC>

                    <Box mt={2}>
                        <Button
                            sx={{
                                fontWeight: '900',
                                letterSpacing: '.2rem',
                                paddingBottom: '.6em',
                                fontSize: '2rem',
                                width: '100%',
                                minHeight: '2.2em',
                            }}
                            variant="contained"
                            disabled={loading}
                            onClick={handleConvert}
                        >
                            {!loading ? <CircularProgressZoomify h={'100%'} in size={44}/> : 'CONVERT'}
                        </Button>
                    </Box>
                </FC>
            )}
        </FC>
    );
};

export default Converter;
