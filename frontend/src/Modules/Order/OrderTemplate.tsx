// Modules/Order/OrderTemplate.tsx

import React, {useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'Utils/nextRouter';
import {Message} from 'Core/components/Message';
import {useTheme} from 'Theme/ThemeContext';
import {useAuth} from 'Auth/AuthContext';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC} from "wide-containers";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {redirectWithNextBack} from 'Utils/redirectNext';
import {useTranslation} from "react-i18next";

const OrderTemplate: React.FC = () => {
    const {isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {headerNavHeight} = useNavigation();
    const {plt} = useTheme();
    const {t} = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === false) {
            redirectWithNextBack(navigate, location, '/?auth_modal=True');
            Message.info(t('remember_login_register'), 1, 9000);
        } else setLoading(false);
    }, [isAuthenticated, navigate, location]);


    if (loading) return <CircularProgressZoomify in size={'150px'}/>;

    return (
        <FC px={2} mx={'auto'} pos={'relative'} maxW={'800px'}
            maxH={`calc(100vh - ${headerNavHeight}px)`}>
            <Outlet/>
        </FC>
    );
};

export default OrderTemplate;
