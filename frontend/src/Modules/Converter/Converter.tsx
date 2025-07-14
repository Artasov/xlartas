import React, {useEffect, useState, useRef} from 'react';
import {useApi} from 'Api/useApi';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Collapse,
    Typography,
    useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDropZone from 'UI/FileDropZone';
import FormatPicker from './FormatPicker';
import FormatParametersSettings from './FormatParametersSettings';
import {IConversion, IFormat, IParameter} from 'types/converter';
import {FC, FCCC, FR, FRSC} from "wide-containers";
import ConverterGuide from './ConverterGuide';
import {Message} from 'Modules/Core/components/Message';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";
import {useTheme} from 'Modules/Theme/ThemeContext';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import {buildWSUrl} from 'Utils/ws';

const Converter: React.FC = () => {
    const {theme, plt} = useTheme();
    const {api} = useApi();
    const [source, setSource] = useState<IFormat | null>(null);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [targets, setTargets] = useState<IFormat[]>([]);
    const [params, setParams] = useState<IParameter[]>([]);
    const [values, setValues] = useState<Record<string, any>>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [conversion, setConversion] = useState<IConversion | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [formats, setFormats] = useState<IFormat[]>([]);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    useEffect(() => {
        api.get<IFormat[]>('/api/v1/converter/formats/')
            .then(setFormats);
    }, [api]);

    useEffect(() => {
        if (!source) return;
        api.get<IFormat[]>(`/api/v1/converter/formats/${source.id}/variants/`)
            .then(setTargets);
        api.get<IParameter[]>(`/api/v1/converter/formats/${source.id}/parameters/`)
            .then(setParams);
    }, [source, api]);

    useEffect(() => {
        const defaults: Record<string, any> = {};
        params.forEach(p => {
            defaults[p.name] = p.default_value ?? null;
        });
        setValues(defaults);
    }, [params]);

    useEffect(() => {
        if (!file || formats.length === 0) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const fmt = formats.find(f => f.name.toLowerCase() === ext);
        if (fmt) {
            setTargetId(null);
            setSource(fmt);
        } else {
            Message.error(`Неизвестный формат файла${ext ? ` (.${ext})` : ''}`);
            setFile(null);
            setSource(null);
        }
    }, [file, formats]);

    useEffect(() => () => {
        wsRef.current?.close();
    }, []);


    const handleConvert = () => {
        if (!file || !source || !targetId) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_format', String(source.id));
        formData.append('target_format', String(targetId));
        formData.append('params', JSON.stringify(values));
        setLoading(true);
        api.post<IConversion>('/api/v1/converter/convert/', formData)
            .then(data => {
                setConversion(data);
                const ws = new WebSocket(buildWSUrl(`/ws/converter/${data.id}/`));
                wsRef.current = ws;
                ws.onmessage = e => {
                    try {
                        const obj = JSON.parse(e.data);
                        if (obj.event === 'conversion_done') {
                            setConversion(obj.conversion);
                            setLoading(false);
                            ws.close();
                        }
                    } catch {
                        /* ignore */
                    }
                };
                ws.onclose = () => {
                    wsRef.current = null;
                };
            })
            .catch(() => setLoading(false));
    };

    return (
        <FC w={'100%'} px={2} maxW={600} mx={'auto'}>
            <ConverterGuide/>
            <FC grow mt={1}>
                <FileDropZone file={file} onChange={setFile}/>
                {conversion?.is_done && conversion.output_file && (
                    <Box mt={1}>
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
            {file && source && (
                <FC g={1}>
                    <FR g={1}>
                        <FC grow>
                            <Collapse in={!targetId} unmountOnExit timeout={400}>
                                <FRSC mt={1}>
                                    <ArrowDropDownRoundedIcon sx={{fontSize: '6rem', m: -3}}/>
                                    <FR fontSize={'1.3rem'} sx={{lineHeight: '1.2rem'}}>
                                        Выберите формат для конвертации
                                    </FR>
                                </FRSC>
                            </Collapse>
                            <FC mt={1}>
                                <FormatPicker
                                    formats={targets}
                                    value={targetId ?? undefined}
                                    onChange={setTargetId}
                                />
                            </FC>
                            <Collapse in={Boolean(targetId)} unmountOnExit timeout={400}>
                                <FC g={1} mt={1}>
                                    {params.length > 0 && (
                                        <Accordion>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                                Параметры
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <FC g={1}>
                                                    <FormatParametersSettings
                                                        parameters={params}
                                                        values={values}
                                                        onChange={(n, v) => setValues(prev => ({...prev, [n]: v}))}
                                                    />
                                                </FC>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </FC>
                            </Collapse>
                        </FC>
                        <FCCC pt={.4} mr={-2} ml={-2.6}>
                            <FR mb={-3.3} w={'4px'} h={'100%'} rounded={1} bg={plt.text.primary}></FR>
                            <KeyboardArrowDownRoundedIcon sx={{fontSize: '3rem', mb: -2}}/>
                        </FCCC>
                    </FR>
                    <Collapse in={Boolean(targetId)}>
                        <Button
                            sx={{
                                fontWeight: '900',
                                letterSpacing: isGtSm ? '.2rem' : '.07rem',
                                paddingBottom: '.6em',
                                fontSize: isGtSm ? '2rem': '1.5rem',
                                width: '100%',
                                minHeight: '2.2em',
                                backgroundColor: '#ffffff',
                                color: '#000',
                                '&:hover': {
                                    color: '#fff',
                                    backgroundColor: '#000',
                                },
                            }}
                            variant="contained"
                            disabled={loading}
                            onClick={handleConvert}
                        >
                            <CircularProgressZoomify h="100%" in={loading} size={44}/>
                            <Collapse in={!loading} orientation="horizontal" unmountOnExit timeout={400}>
                                <span>
                                    Convert&nbsp;to&nbsp;
                                    <span style={{color: theme.colors.primary.main}}>
                                        {targets.find(t => t.id === targetId)?.name ?? ''}
                                    </span>
                                </span>
                            </Collapse>
                        </Button>
                    </Collapse>
                </FC>
            )}
        </FC>
    );
};

export default Converter;
