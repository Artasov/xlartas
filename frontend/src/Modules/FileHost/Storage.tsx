import React from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {Tab, Tabs} from '@mui/material';
import Master from './Master';
import AllFiles from './AllFiles';
import FavoriteFiles from './FavoriteFiles';
import StorageUsageBar from './StorageUsageBar';
import FileDetail from './FileDetail';
import {FC, FR} from 'wide-containers';
import {useTranslation} from 'react-i18next';

const Storage: React.FC = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const current = location.pathname.startsWith('/storage/files/favorite/')
        ? '/storage/files/favorite/'
        : location.pathname.startsWith('/storage/files/all/')
            ? '/storage/files/all/'
            : '/storage/master/';

    return (
        <FC h={'100%'}>
            <Tabs value={current} onChange={(_, v) => navigate(v)} sx={{px: 2}}>
                <Tab value="/storage/master/" label={t('storage')}/>
                <Tab value="/storage/files/all/" label={t('all_files')}/>
                <Tab value="/storage/files/favorite/" label={t('favorites')}/>
            </Tabs>
            <FR mt={.4} w={'100%'}><StorageUsageBar/></FR>
            <Routes>
                <Route path="master/" element={<Master/>}/>
                <Route path="master/:id/" element={<Master/>}/>
                <Route path="files/all/" element={<AllFiles/>}/>
                <Route path="files/favorite/" element={<FavoriteFiles/>}/>
                <Route path="files/:id/" element={<FileDetail/>}/>
            </Routes>
        </FC>
    );
};

export default Storage;
