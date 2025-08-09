// Modules/Software/Softwares.tsx
"use client";
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'Utils/nextRouter';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC, FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {ISoftware} from './Types/Software';
import SoftwareCard from './SoftwareCard';
import {useTranslation} from 'react-i18next';
import Collapse from '@mui/material/Collapse';
import {useSoftwareApi} from './useSoftwareApi';

interface SoftwaresProps {
    initialSoftwares?: ISoftware[];
}

const Softwares: React.FC<SoftwaresProps> = ({initialSoftwares = []}) => {
    const [softwares, setSoftwares] = useState<ISoftware[]>(initialSoftwares);
    const [loading, setLoading] = useState(initialSoftwares.length === 0);
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const {listSoftware} = useSoftwareApi();
    const {t} = useTranslation();

    useEffect(() => {
        if (initialSoftwares.length === 0) {
            setLoading(true);
            setAnimate(false);
            listSoftware()
                .then(data => setSoftwares(data))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [initialSoftwares.length, listSoftware]);

    useEffect(() => {
        if (!loading) {
            const t = setTimeout(() => setAnimate(true), 50);
            return () => clearTimeout(t);
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
