// xl/frontend/src/Modules/xLMine/SkinCapeSetter.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {useApi} from 'Modules/Api/useApi';
import SkinCapeView from "./SkinCapeView";
import Button from "Core/components/elements/Button/Button";
import {FC, FRCC} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import {Message} from 'Core/components/Message';


const SkinCapeSetter: React.FC = () => {
    const {api} = useApi();
    const [skinUrl, setSkinUrl] = useState<string | null>(null);
    const [capeUrl, setCapeUrl] = useState<string | null>(null);
    const {plt} = useTheme();
    const fetchCurrent = useCallback(async () => {
        const data = await api.get('/api/v1/xlmine/current/skin-cape/');
        if (data?.skin) setSkinUrl(data.skin);
        if (data?.cape) setCapeUrl(data.cape);
    }, [api]);

    useEffect(() => {
        fetchCurrent();
    }, [fetchCurrent]);

    const uploadFile = async (file: File, type: 'skin' | 'cape') => {
        const fd = new FormData();
        fd.append(type, file);
        api.post(`/api/v1/xlmine/${type === 'skin' ? 'skin' : 'cape'}/`, fd, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(data => {
            if (type === 'skin') setSkinUrl(data.skin);
            else if (type === 'cape') setCapeUrl(data.cape);
            Message.success('Успешно обновлено')
        }).catch(_ => Message.error('Не удалось обновить'));

        await fetchCurrent();
    };

    return (
        <FC w={'fit-content'} pb={2} rounded={3}>
            <SkinCapeView skinUrl={skinUrl} capeUrl={capeUrl}/>
            <FRCC wrap g={1}>
                <Button variant="contained" size={'small'} sx={{fontWeight: 'bold'}} component="label">
                    Скин
                    <input hidden accept=".png" type="file"
                           onChange={e => {
                               const f = e.target.files?.[0];
                               if (f) uploadFile(f, 'skin');
                           }}/>
                </Button>
                <Button variant="contained" size={'small'} sx={{fontWeight: 'bold'}} component="label">
                    Плащ
                    <input hidden accept=".png" type="file"
                           onChange={e => {
                               const f = e.target.files?.[0];
                               if (f) uploadFile(f, 'cape');
                           }}/>
                </Button>
            </FRCC>
        </FC>
    );
};

export default SkinCapeSetter;
