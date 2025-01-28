// Order/OrderTemplate.tsx

import React, {useContext, useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Message} from 'Core/components/Message';
import {useTheme} from 'Theme/ThemeContext';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC} from "WideLayout/Layouts";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {redirectWithNextBack} from 'Utils/redirectNext';

const OrderTemplate: React.FC = () => {
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const location = useLocation();
    const {headerNavHeight} = useNavigation();
    const {theme} = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === false) {
            redirectWithNextBack(navigate, location, '/?auth_modal=True');
            Message.info('Мы сохранили ваш выбор, войдите или зарегистрируйтесь для продолжения.', 1, 9000);
        } else setLoading(false);
    }, [isAuthenticated, navigate, location]);


    if (loading) return <CircularProgress size={'150px'}/>;

    return (
        <FC px={2} mx={'auto'} pos={'relative'} maxW={'800px'}
            maxH={`calc(100vh - ${headerNavHeight}px)`}>
            <Outlet/>
        </FC>
    );
};

export default OrderTemplate;
