// Modules/Software/Licenses.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApi} from '../Api/useApi';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FCC, FCCC, FR} from 'wide-containers';
import LicenseCard from './LicenseCard';
import {Message} from 'Core/components/Message';
import Collapse from '@mui/material/Collapse';

const Licenses: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/software/licenses/')
            .then(data => setLicenses(data))
            .catch(() => Message.error(t('licenses_load_error')))
            .finally(() => setLoading(false));
    }, [api]);

    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);


    return (
        <FR wrap g={2} p={2}>
            {loading
                ? <FCCC w={'100%'} mt={5}><CircularProgress size="90px"/></FCCC>
                : licenses && licenses.length > 0
                    ? licenses.map((license, index) => (
                        <Collapse
                            key={license.id}
                            in={animate}
                            timeout={200 + index * 100}
                            mountOnEnter
                            unmountOnExit={false}
                        >
                            <LicenseCard license={license}/>
                        </Collapse>
                    ))
                    : <FCC>Лицензии не найдены</FCC>
            }
        </FR>
    );
};

export default Licenses;
