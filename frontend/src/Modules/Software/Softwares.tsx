// Modules/Software/Softwares.tsx

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FRCC} from 'wide-containers';
import {useTheme} from "Theme/ThemeContext";
import {ISoftware} from "./Types/Software";
import {useApi} from "../Api/useApi";
import SoftwareCard from "./SoftwareCard";
import {useTranslation} from 'react-i18next';


const Softwares: React.FC = () => {
    const [softwares, setSoftwares] = useState<ISoftware[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const {api} = useApi();
    const {t} = useTranslation();

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/software/').then(data => {
            setSoftwares(data);
        }).finally(() => setLoading(false));
    }, [api]);

    if (loading) return <FRCC mt={5} w={'100%'}><CircularProgress size={'90px'}/></FRCC>;

    return (
        <FRCC g={2} wrap>
            {softwares.length
                ? softwares.map(software => <SoftwareCard
                    key={software.id}
                    software={software}
                    onClick={() => navigate(`/softwares/${software.id}`)}
                />)
                : <FRCC>{t('no_softwares')}</FRCC>
            }
        </FRCC>
    );
};

export default Softwares;
