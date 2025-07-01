import React, {useEffect, useState} from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {useApi} from '../Api/useApi';
import {useTranslation} from 'react-i18next';
import {FRC} from 'wide-containers';

const StorageUsageBar: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [used, setUsed] = useState(0);
    const [limit, setLimit] = useState(1);

    useEffect(() => {
        api.get('/api/v1/filehost/storage/usage/').then(data => {
            setUsed(data.used);
            setLimit(data.limit);
        }).catch(() => null);
    }, [api]);

    const percent = Math.min(100, (used / limit) * 100);

    return (
        <FRC g={0.5} px={2}>
            <LinearProgress variant="determinate" value={percent} sx={{flexGrow:1, height:8, borderRadius:4}}/>
            <span style={{fontSize:'0.8rem'}}>{(used/1024/1024).toFixed(1)} / {(limit/1024/1024).toFixed(0)} MB</span>
        </FRC>
    );
};

export default StorageUsageBar;
