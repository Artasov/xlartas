import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, CircularProgress} from '@mui/material';
import FormatPicker from './FormatPicker';
import ParameterForm from './ParameterForm';
import {IFormat, IParameter} from 'types/converter';

const Converter: React.FC = () => {
    const [source, setSource] = useState<IFormat | null>(null);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [targets, setTargets] = useState<IFormat[]>([]);
    const [params, setParams] = useState<IParameter[]>([]);
    const [values, setValues] = useState<Record<string, any>>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [formats, setFormats] = useState<IFormat[]>([]);

    useEffect(() => {
        axios.get('/api/v1/converter/formats/').then(r => setFormats(r.data));
    }, []);

    useEffect(() => {
        if (source) {
            axios.get(`/api/v1/converter/formats/${source.id}/variants/`).then(r => setTargets(r.data));
            axios.get(`/api/v1/converter/formats/${source.id}/parameters/`).then(r => setParams(r.data));
        }
    }, [source]);

    const handleConvert = () => {
        if (!file || !source || !targetId) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_format', String(source.id));
        formData.append('target_format', String(targetId));
        formData.append('params', JSON.stringify(values));
        setLoading(true);
        axios.post('/api/v1/converter/convert/', formData).then(r => {
            const url = r.data.output_file;
            if (url) window.location.href = url;
        }).finally(() => setLoading(false));
    };

    return (
        <div>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}/>
            <FormatPicker formats={formats} value={source?.id} onChange={id => {
                const f = formats.find(f => f.id === id) || null;
                setSource(f);
            }}/>
            {source && <FormatPicker formats={targets} value={targetId || undefined} onChange={setTargetId}/>} 
            {params.length > 0 && <ParameterForm parameters={params} values={values} onChange={(n, v) => setValues(prev => ({...prev, [n]: v}))}/>} 
            <Button variant="contained" disabled={loading} onClick={handleConvert}>
                {loading ? <CircularProgress size={24}/> : 'Convert'}
            </Button>
        </div>
    );
};

export default Converter;
