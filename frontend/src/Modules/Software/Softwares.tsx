// Modules/Software/Softwares.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {ISoftware} from './Types/Software';
import {useApi} from 'Api/useApi';
import SoftwareCard from './SoftwareCard';
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
        setAnimate(false);
        api.get('/api/v1/software/')
            .then(data => setSoftwares(data))
            .finally(() => setLoading(false));
    }, [api]);

    useEffect(() => {
        if (!loading) {
            setTimeout(() => setAnimate(true), 50)
        }
    }, [loading]);

    return (
        <FRCC g={2} wrap position="relative" w="100%">
            <CircularProgressZoomify in={loading} mt={'10%'} size="90px"/>
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
            {!loading && softwares.length === 0 && (
                <FRCC>{t('no_softwares')}</FRCC>
            )}
        </FRCC>
    );
};

export default Softwares;
