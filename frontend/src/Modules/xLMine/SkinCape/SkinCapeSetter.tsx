// Modules/xLMine/SkinCapeSetter.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {useApi} from 'Modules/Api/useApi';
import SkinCapeView from "./SkinCapeView";
import Button from "Core/components/elements/Button/Button";
import {FC, FCC, FRCC} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import {Message} from 'Core/components/Message';

const SkinCapeSetter: React.FC = () => {
    const {api} = useApi();
    const [skinUrl, setSkinUrl] = useState<string | null>(null);
    const [capeUrl, setCapeUrl] = useState<string | null>(null);
    const [validSkin, setValidSkin] = useState<boolean>(false);
    const [validCape, setValidCape] = useState<boolean>(false);
    const {plt} = useTheme();

    const fetchCurrent = useCallback(async () => {
        const data = await api.get('/api/v1/xlmine/current/skin-cape/');
        if (data?.skin) setSkinUrl(data.skin);
        else setSkinUrl(null);
        if (data?.cape) setCapeUrl(data.cape);
        else setCapeUrl(null);
    }, [api]);

    useEffect(() => {
        fetchCurrent();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        async function checkSkin() {
            if (!skinUrl) {
                setValidSkin(false);
                return;
            }
            try {
                const res = await fetch(skinUrl, {method: 'HEAD'});
                setValidSkin(Boolean(res.ok && res.headers.get('content-type')?.startsWith('image')));
            } catch {
                setValidSkin(false);
            }
        }

        checkSkin();
    }, [skinUrl]);

    useEffect(() => {
        async function checkCape() {
            if (!capeUrl) {
                setValidCape(false);
                return;
            }
            try {
                const res = await fetch(capeUrl, {method: 'HEAD'});
                setValidCape(Boolean(res.ok && res.headers.get('content-type')?.startsWith('image')));
            } catch {
                setValidCape(false);
            }
        }

        checkCape();
    }, [capeUrl]);

    const uploadFile = async (file: File, type: 'skin' | 'cape') => {
        const fd = new FormData();
        fd.append(type, file);
        try {
            const data = await api.post(
                `/api/v1/xlmine/${type === 'skin' ? 'skin' : 'cape'}/`,
                fd,
                {headers: {'Content-Type': 'multipart/form-data'}}
            );
            if (type === 'skin') setSkinUrl(data.skin);
            else setCapeUrl(data.cape);
            Message.success('Успешно обновлено');
        } catch {
            Message.error('Не удалось обновить');
        }
        await fetchCurrent();
    };

    return (
        <FCC w={'fit-content'} pb={2} rounded={3}>
            {validSkin && (
                <SkinCapeView
                    skinUrl={skinUrl!}
                    capeUrl={validCape ? capeUrl! : null}
                />
            )}
            <FRCC wrap g={1}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{fontWeight: 'bold'}}
                    component="label"
                >
                    Скин
                    <input
                        hidden
                        accept=".png"
                        type="file"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(f, 'skin');
                        }}
                    />
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    sx={{fontWeight: 'bold'}}
                    component="label"
                >
                    Плащ
                    <input
                        hidden
                        accept=".png"
                        type="file"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(f, 'cape');
                        }}
                    />
                </Button>
            </FRCC>
        </FCC>
    );
};

export default SkinCapeSetter;