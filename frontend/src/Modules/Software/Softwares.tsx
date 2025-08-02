// Modules/Software/Softwares.tsx
"use client";
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'Utils/nextRouter';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC, FRCC} from 'wide-containers';
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

    return (<FC>
            <Collapse in={animate} timeout={800} mountOnEnter
                      unmountOnExit={false}>
                <h1 className={"fs-1 lh-1 text-center"}>{t('softwares')}</h1>
            </Collapse>
            <FRCC g={2} wrap position="relative" w="100%">
                <CircularProgressZoomify in={loading} mt={'10%'} size="90px"/>
                {softwares.length > 0 &&
                    softwares.map((software, index) => (
                        <Collapse
                            key={software.id}
                            in={animate}
                            timeout={700 + index * 100}
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
            </FRCC></FC>
    );
};

export default Softwares;
