// Modules/Software/Licenses.tsx
import React, {useEffect, useState} from 'react';
import {useApi} from '../Api/useApi';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FCC, FCCC, FR} from 'wide-containers';
import LicenseCard from './LicenseCard';
import {Message} from 'Core/components/Message';

const Licenses: React.FC = () => {
    const {api} = useApi();
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/software/licenses/')
            .then(data => setLicenses(data))
            .catch(() => Message.error('Ошибка загрузки лицензий'))
            .finally(() => setLoading(false));
    }, [api]);


    return (
        <FR wrap g={2} p={2}>
            {loading
                ? <FCCC w={'100%'} mt={5}><CircularProgress size="90px"/></FCCC>
                : licenses && licenses.length > 0
                    ? licenses.map(license => <LicenseCard key={license.id} license={license}/>)
                    : <FCC>Лицензии не найдены</FCC>
            }
        </FR>
    );
};

export default Licenses;
