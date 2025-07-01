import React from 'react';
import {NavLink, Route, Routes} from 'react-router-dom';
import Master from './Master';
import AllFiles from './AllFiles';
import FavoriteFiles from './FavoriteFiles';
import StorageUsageBar from './StorageUsageBar';
import {FC, FRSE} from 'wide-containers';
import {useTranslation} from 'react-i18next';

const Storage: React.FC = () => {
    const {t} = useTranslation();
    return (
        <FC g={1} h={'100%'}>
            <StorageUsageBar/>
            <FRSE g={1} px={2}>
                <NavLink to="/storage/master/">{t('storage')}</NavLink>
                <NavLink to="/storage/files/all/">{t('all_files')}</NavLink>
                <NavLink to="/storage/files/favorite/">{t('favorites')}</NavLink>
            </FRSE>
            <Routes>
                <Route path="master/" element={<Master/>}/>
                <Route path="files/all/" element={<AllFiles/>}/>
                <Route path="files/favorite/" element={<FavoriteFiles/>}/>
            </Routes>
        </FC>
    );
};

export default Storage;
