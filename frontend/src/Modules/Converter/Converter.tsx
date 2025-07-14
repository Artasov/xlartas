import React, {useEffect, useRef, useState} from 'react';
import {useApi} from 'Api/useApi';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    IconButton,
    Button,
    Collapse,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDropZone from 'UI/FileDropZone';
import FormatPicker from './FormatPicker';
import FormatParametersSettings from './FormatParametersSettings';
import {IConversion, IConvertResult, IFormat, IParameter} from 'types/converter';
import {FC, FCCC, FR, FRSC} from "wide-containers";
import ConverterGuide from './ConverterGuide';
import {Message} from 'Modules/Core/components/Message';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";
import {useTheme} from 'Modules/Theme/ThemeContext';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {buildWSUrl} from 'Utils/ws';
import formatFileSize from 'Utils/formatFileSize';
import {useTranslation} from 'react-i18next';

const wsFmt = (x: unknown) => {
    if (typeof x === 'string') {
        return x.length > 500 ? `${x.slice(0, 497)}...` : x;
    }
    return x;
};

const logWSReq = (u: string) => console.info(`WS \u2794 ${u}`);
const logWSMsg = (u: string, d: unknown) => console.info(`WS \u21f3 ${u}`, wsFmt(d));

const Converter: React.FC = () => {
    const {theme, plt} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();
    const [source, setSource] = useState<IFormat | null>(null);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [targets, setTargets] = useState<IFormat[]>([]);
    const [params, setParams] = useState<IParameter[]>([]);
    const [values, setValues] = useState<Record<string, any>>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [conversions, setConversions] = useState<IConversion[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const [formats, setFormats] = useState<IFormat[]>([]);
    const [renameOpen, setRenameOpen] = useState(false);
    const [outputName, setOutputName] = useState('');
    const [remaining, setRemaining] = useState<number | null>(null);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    useEffect(() => {
        api.get<IFormat[]>('/api/v1/converter/formats/')
            .then(setFormats);
        api.get<{remaining: number}>('/api/v1/converter/remaining/')
            .then(res => setRemaining(res.remaining));
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
            Message.error(t('converter_unknown_format', {ext: ext ? ` (.${ext})` : ''}));
            setFile(null);
            setSource(null);
        }
    }, [file, formats]);

    useEffect(() => {
        if (!file || !targetId) {
            setOutputName('');
            return;
        }
        const target = targets.find(t => t.id === targetId);
        if (!target) return;
        const base = file.name.replace(/\.[^/.]+$/, '');
        const defName = `${base}.${target.name}`;
        if (!renameOpen || outputName === '') {
            setOutputName(defName);
        } else if (renameOpen) {
            setOutputName(prev => `${prev.replace(/\.[^/.]+$/, '')}.${target.name}`);
        }
    }, [file, targetId, targets, renameOpen, outputName]);

    useEffect(() => () => {
        wsRef.current?.close();
    }, []);


    const handleConvert = () => {
        if (!file || !source || !targetId) return;
        if (outputName.length > 100) {
            Message.error(t('converter_file_name_too_long'));
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_format', String(source.id));
        formData.append('target_format', String(targetId));
        formData.append('params', JSON.stringify(values));
        if (outputName) formData.append('output_name', outputName);
        setLoading(true);
        api.post<IConvertResult>('/api/v1/converter/convert/', formData)
            .then(data => {
                setConversions(prev => [...prev, data.conversion]);
                setRemaining(data.remaining);
                const url = buildWSUrl(`/ws/converter/${data.conversion.id}/`);
                logWSReq(url);
                const ws = new WebSocket(url);
                wsRef.current = ws;
                ws.onmessage = e => {
                    try {
                        const obj = JSON.parse(e.data);
                        logWSMsg(url, obj);
                        if (obj.event === 'conversion_done') {
                            setConversions(prev => prev.map(c => c.id === obj.conversion.id ? obj.conversion : c));
                            setLoading(false);
                            setTargetId(null);
                            ws.close();
                        }
                    } catch {
                        logWSMsg(url, e.data);
                    }
                };
                ws.onclose = () => {
                    logWSMsg(url, {event: 'close'});
                    wsRef.current = null;
                };
            })
            .catch(() => setLoading(false));
    };

    return (
        <FC w={'100%'} px={2} maxW={600} mx={'auto'}>
            <ConverterGuide/>
            {remaining !== null && (
                <Typography align="center" fontWeight={600} mt={1}>
                    {t('converter_remaining', {count: remaining})}
                </Typography>
            )}
            <FC grow mt={1}>
                <FileDropZone file={file} onChange={setFile}/>
            </FC>
            {file && source && (
                <FC g={1}>
                    <FR g={1}>
                        <FC grow>
                            <Collapse in={!targetId} unmountOnExit timeout={400}>
                                <FRSC mt={1}>
                                    <ArrowDropDownRoundedIcon sx={{fontSize: '6rem', m: -3}}/>
                                    <FR fontSize={'1.3rem'} sx={{lineHeight: '1.2rem'}}>
                                        {t('converter_select_format')}
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
                                <FC mt={1}>
                                    {params.length > 0 && (
                                        <Accordion>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                                {t('converter_parameters')}
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
                                    <Collapse in={!renameOpen} unmountOnExit timeout={400}>
                                        <FRSC mt={1} g={1}>
                                            <Typography variant={'h6'} sx={{
                                                color: plt.text.primary,
                                                fontWeight: '600'
                                            }}>
                                                {outputName}
                                            </Typography>
                                            <Button onClick={() => {
                                                if (!renameOpen) {
                                                    const target = targets.find(t => t.id === targetId);
                                                    const base = file?.name.replace(/\.[^/.]+$/, '') ?? '';
                                                    if (target) setOutputName(`${base}.${target.name}`);
                                                }
                                                setRenameOpen(true);
                                            }}>
                                                {t('converter_rename')}
                                            </Button>
                                        </FRSC>
                                    </Collapse>
                                    <Collapse in={renameOpen} timeout={400}>
                                        <TextField
                                            label={t('converter_output_name')} size="small"
                                            value={outputName}
                                            sx={{
                                                mt: 1.4, width: '98%',
                                                '& .MuiInputBase-input': {
                                                    fontSize: '1.4rem'
                                                }
                                            }}
                                            onChange={e => setOutputName(e.target.value)}
                                        />
                                    </Collapse>
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
                                fontSize: isGtSm ? '2rem' : '1.5rem',
                                width: '100%',
                                minHeight: '2.2em',
                                backgroundColor: '#ffffff',
                                color: '#000',
                                '&:hover': {
                                    color: theme.colors.primary.main,
                                    backgroundColor: plt.text.primary,
                                },
                            }}
                            variant="contained"
                            disabled={loading}
                            onClick={handleConvert}
                        >
                            <CircularProgressZoomify h="100%" in={loading} size={44}/>
                            <Collapse in={!loading} orientation="horizontal" unmountOnExit timeout={400}>
                                <span>
                                    {t('converter_convert_to', {format: targets.find(t => t.id === targetId)?.name ?? ''})}
                                </span>
                            </Collapse>
                        </Button>
                    </Collapse>
                    {conversions.map(c => (
                        c.is_done && c.output_file && (
                            <Box key={c.id} mt={1}>
                                <Typography>{c.output_name ?? c.output_file.split('/')?.pop()}</Typography>
                                {typeof c.size === 'number' && (
                                    <Typography variant="caption">
                                        {formatFileSize(c.size)}
                                    </Typography>
                                )}
                                <Box mt={1}>
                                    <IconButton color="primary" href={`/api/v1/converter/download/${c.id}/`}>
                                        <DownloadRoundedIcon/>
                                    </IconButton>
                                </Box>
                            </Box>
                        )
                    ))}
                </FC>
            )}
        </FC>
    );
};

export default Converter;
