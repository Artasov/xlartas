// Modules/Software/Licenses.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSoftwareApi} from 'Software/useSoftwareApi';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FCC, FR} from 'wide-containers';
import LicenseCard from './LicenseCard';
import {Message} from 'Core/components/Message';
import Collapse from '@mui/material/Collapse';

const Licenses: React.FC = () => {
    const {listLicenses} = useSoftwareApi();
    const {t} = useTranslation();
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setLoading(true);
        setAnimate(false);
        listLicenses()
            .then(data => setLicenses(data))
            .catch(() => Message.error(t('licenses_load_error')))
            .finally(() => setLoading(false));
    }, [listLicenses, t]);

    useEffect(() => {
        if (!loading) setAnimate(true);
    }, [loading]);

    return (
        <FR wrap g={2} p={2} position="relative" cls="licenses">
            <CircularProgressZoomify in={loading} mt={'10%'} size="90px"/>
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
            {!loading && licenses.length === 0 && (
                <FCC w="100%" p={2} textAlign="center">
                    {t('licenses_not_found') ?? 'Лицензии не найдены'}
                </FCC>
            )}
        </FR>
    );
};

export default Licenses;
