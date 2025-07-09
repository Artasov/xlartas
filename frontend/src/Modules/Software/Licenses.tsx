import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApi} from '../Api/useApi';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FCC, FCCC, FR} from 'wide-containers';
import LicenseCard from './LicenseCard';
import {Message} from 'Core/components/Message';
import Collapse from '@mui/material/Collapse';
import Zoom from '@mui/material/Zoom'; // ← NEW

const Licenses: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    /* ---------- загрузка лицензий ---------- */
    useEffect(() => {
        setLoading(true);
        setAnimate(false);                           // ← сбрасываем анимацию
        api.get('/api/v1/software/licenses/')
            .then(data => setLicenses(data))
            .catch(() => Message.error(t('licenses_load_error')))
            .finally(() => setLoading(false));
    }, [api, t]);

    /* ---------- старт анимации карточек после загрузки ---------- */
    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    /* ---------- рендер ---------- */
    return (
        <FR wrap g={2} p={2} position="relative" cls="licenses">
            {/* ---------------- Лоадер ---------------- */}
            <Zoom
                in={loading}
                appear
                mountOnEnter
                unmountOnExit
                timeout={{enter: 300, exit: 300}}
            >
                <FCCC
                    w="100%"
                    mt={5}
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    zIndex={1}
                >
                    <CircularProgress size="90px"/>
                </FCCC>
            </Zoom>

            {/* ---------------- Список лицензий ---------------- */}
            {licenses.length > 0 &&
                licenses.map((license, index) => (
                    <Collapse
                        key={license.id}
                        in={animate}
                        timeout={400 + index * 100}
                        mountOnEnter
                        unmountOnExit={false}
                    >
                        <LicenseCard license={license}/>
                    </Collapse>
                ))}

            {/* ---------------- Сообщение «нет лицензий» ---------------- */}
            {!loading && licenses.length === 0 && (
                <FCC w="100%" p={2} textAlign="center">
                    {t('licenses_not_found') ?? 'Лицензии не найдены'}
                </FCC>
            )}
        </FR>
    );
};

export default Licenses;
