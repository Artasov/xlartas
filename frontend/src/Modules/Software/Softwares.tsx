import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {ISoftware} from './Types/Software';
import {useApi} from 'Api/useApi';
import SoftwareCard from './SoftwareCard';
import {useTranslation} from 'react-i18next';
import Collapse from '@mui/material/Collapse';
import Zoom from '@mui/material/Zoom'; // ← NEW

const Softwares: React.FC = () => {
    const [softwares, setSoftwares] = useState<ISoftware[]>([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();

    /* ---------- загрузка ПО ---------- */
    useEffect(() => {
        setLoading(true);
        setAnimate(false);                           // ← сбрасываем анимацию
        api.get('/api/v1/software/')
            .then(data => setSoftwares(data))
            .finally(() => setLoading(false));
    }, [api]);

    /* ---------- старт анимации карточек после загрузки ---------- */
    useEffect(() => {
        if (!loading) {
            setTimeout(() => setAnimate(true), 50)
        }
    }, [loading]);

    /* ---------- рендер ---------- */
    return (
        <FRCC g={2} wrap position="relative" w="100%">
            {/* ---------------- Лоадер ---------------- */}
            <Zoom
                in={loading}
                appear
                mountOnEnter
                unmountOnExit
                timeout={{enter: 300, exit: 300}}
            >
                <FRCC
                    mt={5}
                    w="100%"
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    zIndex={1}
                >
                    <CircularProgress size="90px"/>
                </FRCC>
            </Zoom>

            {/* ---------------- Список ПО ---------------- */}
            {softwares.length > 0 &&
                softwares.map((software, index) => (
                    <Collapse
                        key={software.id}
                        in={animate}
                        timeout={500 + index * 100}
                        mountOnEnter
                        unmountOnExit={false}
                    >
                        <SoftwareCard
                            software={software}
                            onClick={() => navigate(`/softwares/${software.id}`)}
                        />
                    </Collapse>
                ))}

            {/* ---------------- Сообщение «нет ПО» ---------------- */}
            {!loading && softwares.length === 0 && (
                <FRCC>{t('no_softwares')}</FRCC>
            )}
        </FRCC>
    );
};

export default Softwares;
