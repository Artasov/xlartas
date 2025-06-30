import React, {useContext} from 'react';
import {FC, FR, FRSC} from 'wide-containers';
import SkinCapeSetter from './SkinCape/SkinCapeSetter';
import UserPrivilege from './Privilege/UserPrivilege';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {useMediaQuery} from '@mui/material';
import {useTheme} from 'Theme/ThemeContext';

const XLMineProfileInfoForm: React.FC = () => {
    const {user} = useContext(AuthContext) as AuthContextType;
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const {plt} = useTheme();

    if (!user) return null;

    return (
        <FR wrap g={1} mb={2}>
            <FC >
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
                <FR>{user.coins} монет</FR>
            </FC>
        </FR>
    );
};

export default XLMineProfileInfoForm;
