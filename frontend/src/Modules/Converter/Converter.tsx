import React, {useEffect, useState} from 'react';
import {useApi} from 'Api/useApi';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Collapse,
    Typography
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
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';

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
    const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
    const [formats, setFormats] = useState<IFormat[]>([]);

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
            setSource(fmt);
        } else {
            Message.error(`Неизвестный формат файла${ext ? ` (.${ext})` : ''}`);
            setFile(null);
            setSource(null);
        }
    }, [file, formats]);

    const pollStatus = (id: number) => {
        const t = setInterval(() => {
            api.get<IConversion>(`/api/v1/converter/conversion/${id}/`)
                .then(data => {
                    setConversion(data);
                    if (data.is_done) {
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
        api.post<IConversion>('/api/v1/converter/convert/', formData)
            .then(data => {
                setConversion(data);
                pollStatus(data.id);
            })
            .catch(() => setLoading(false));
    };

    return (
        <FC w={'100%'} px={2} maxW={600} mx={'auto'}>
            <ConverterGuide/>
            <FC grow mt={1}>
                <FileDropZone file={file} onChange={setFile}/>
                {conversion && !conversion.is_done && (
                    <Box mt={1}><CircularProgress/></Box>
                )}

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

            {/* Правая колонка: выбор форматов и параметров */}
            {file && source && (
                <FC g={1} mt={1}>
                    <FR g={1}>
                        <FC g={1} grow>
                            <FormatPicker
                                formats={targets}
                                value={targetId ?? undefined}
                                onChange={setTargetId}
                            />
                            <Collapse in={!targetId} unmountOnExit timeout={400}>
                                <FRSC>
                                    <ArrowDropUpRoundedIcon sx={{fontSize: '6rem', m: -3}}/>
                                    <FR fontSize={'1.3rem'} sx={{lineHeight: '1.2rem'}}>
                                        Выберите формат для конвертации
                                    </FR>
                                </FRSC>
                            </Collapse>
                            <Collapse in={Boolean(targetId)} unmountOnExit timeout={400}>
                                <FC g={1}>
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
                                letterSpacing: '.2rem',
                                paddingBottom: '.6em',
                                fontSize: '2rem',
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
                            {loading
                                ? <CircularProgressZoomify h={'100%'} in size={44}/>
                                : <span>
                                        Convert to <span style={{color: theme.colors.primary.main}}>
                                        {targets.find(t => t.id === targetId)?.name ?? ''}
                                    </span>
                                </span>
                            }
                        </Button>
                    </Collapse>
                </FC>
            )}
        </FC>
    );
};

export default Converter;
