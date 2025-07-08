// Modules/Software/Softwares.tsx

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FRCC} from 'wide-containers';
import {useTheme} from "Theme/ThemeContext";
import {ISoftware} from "./Types/Software";
import {useApi} from "Api/useApi";
import SoftwareCard from "./SoftwareCard";
import {useTranslation} from 'react-i18next';
import Collapse from '@mui/material/Collapse';

const Softwares: React.FC = () => {
    const [softwares, setSoftwares] = useState<ISoftware[]>([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/software/')
            .then(data => {
                setSoftwares(data);
            })
            .finally(() => setLoading(false));
    }, [api]);

    useEffect(() => {
        // Запускаем анимацию после завершения загрузки
        if (!loading) {
            setAnimate(true);
        }
    }, [loading]);

    if (loading)
        return (
            <FRCC mt={5} w={'100%'}>
                <CircularProgress size={'90px'}/>
            </FRCC>
        );

    return (
        <FRCC g={2} wrap>
            {softwares.length
                ? softwares.map((software, index) => (
                    <Collapse
                        key={software.id}
                        in={animate}
                        timeout={200 + index * 100}
                        mountOnEnter
                        unmountOnExit={false}
                    >
                        <SoftwareCard
                            software={software}
                            onClick={() => navigate(`/softwares/${software.id}`)}
                        />
                    </Collapse>
                ))
                : <FRCC>{t('no_softwares')}</FRCC>
            }
        </FRCC>
    );
};

export default Softwares;
