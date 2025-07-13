// Modules/xLMine/xLMineProfileInfoForm.tsx
import React, {useContext, useEffect, useState} from 'react';
import {FC, FR, FRSC} from 'wide-containers';
import SkinCapeSetter from './SkinCape/SkinCapeSetter';
import UserPrivilege from './Privilege/UserPrivilege';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {Collapse, useMediaQuery} from '@mui/material';
import {useTheme} from 'Theme/ThemeContext';
import {useTranslation} from 'react-i18next';

const XLMineProfileInfoForm: React.FC = () => {
    const {user} = useContext(AuthContext) as AuthContextType;
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const [animate, setAnimate] = useState(false);
    const {plt} = useTheme();
    const {t} = useTranslation();

    /* ---------- анимация появления ---------- */
    useEffect(() => {
        setAnimate(true);
    }, []);

    if (!user) return null;

    return (
        <Collapse in={animate} appear timeout={400}>
            <FR wrap g={1} mb={2}>
                <FC>
                    <FRSC wrap g={1}>
                        <FR
                            color={plt.text.primary}
                            fontWeight={'bold'}
                            fontSize={isGtSm ? '2.2rem' : '1.7rem'}
                            lineHeight={'1.8rem'}
                            sx={{userSelect: 'all'}}>
                            {user.username}
                        </FR>
                        <FR mt={.57}
                            lineHeight={'1.5rem'}
                            fontSize={isGtSm ? '1.7rem' : '1.5rem'}
                            fontWeight={'bold'}>
                            <UserPrivilege/>
                        </FR>
                    </FRSC>
                    <FR minW={160} mb={1}><SkinCapeSetter/></FR>
                    <FR>{t('coins_count', {count: user.coins})}</FR>
                </FC>
            </FR>
        </Collapse>
    );
};

export default XLMineProfileInfoForm;
