// Modules/xLMine/SkinCape/SkinCapeSetter.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApi} from 'Modules/Api/useApi';
import {Button} from "@mui/material";
import {FCC, FRCC} from "wide-containers";
import {Message} from 'Core/components/Message';

const SkinCapeSetter: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [skinUrl, setSkinUrl] = useState<string | null>(null);
    const [capeUrl, setCapeUrl] = useState<string | null>(null);
    const [validSkin, setValidSkin] = useState<boolean>(false);
    const [validCape, setValidCape] = useState<boolean>(false);

    const fetchCurrent = useCallback(async () => {
        const data = await api.get('/api/v1/xlmine/current/skin-cape/');
        if (data?.skin) setSkinUrl(data.skin);
        else setSkinUrl(null);
        if (data?.cape) setCapeUrl(data.cape);
        else setCapeUrl(null);
    }, [api]);

    useEffect(() => {
        fetchCurrent().then();
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

        checkSkin().then();
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

        checkCape().then();
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
            Message.success(t('update_success'));
        } catch {
            Message.error(t('update_error'));
        }
        await fetchCurrent();
    };

    return (
        <FCC w={'fit-content'} rounded={3}>
            {/*{validSkin && (*/}
            {/*    <SkinCapeView*/}
            {/*        skinUrl={skinUrl!}*/}
            {/*        capeUrl={validCape ? capeUrl! : null}*/}
            {/*    />*/}
            {/*)}*/}
            <FRCC wrap g={1}>
                <Button
                    size="small"
                    sx={{fontWeight: 'bold'}}
                    component="label"
                >
                    {t('skin')}
                    <input
                        hidden
                        accept=".png"
                        type="file"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(f, 'skin').then();
                        }}
                    />
                </Button>
                <Button
                    size="small"
                    sx={{fontWeight: 'bold'}}
                    component="label"
                >
                    {t('cape')}
                    <input
                        hidden
                        accept=".png"
                        type="file"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(f, 'cape').then();
                        }}
                    />
                </Button>
            </FRCC>
        </FCC>
    );
};

export default SkinCapeSetter;