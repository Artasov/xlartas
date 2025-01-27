// Auth/SignIn.tsx
import React, {useContext, useEffect} from 'react';
import Head from "Core/components/Head";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {useNavigate} from "react-router-dom";
import AuthForm from "Auth/forms/AuthForm";
import {FC, FCAC, FR} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import useMediaQuery from '@mui/material/useMediaQuery';
import ParallaxLogo from "Core/ParallaxLogo";

const SignIn = () => {
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const {theme} = useTheme();
    const {hideMobileMenu, setProfileBtnVisible, setLogoContent, defaultLogoContent} = useNavigation();

    const isGt1200 = useMediaQuery('(min-width:1200px)');
    const isGt1000 = useMediaQuery('(min-width:1000px)');
    const isGt800 = useMediaQuery('(min-width:800px)');

    let scale = 1;
    let translateY = 0;
    let forcedHeight = '100%';

    if (isGt1200) {
        scale = 1.5;
        translateY = 5;
        forcedHeight = '990px';
    } else if (isGt1000) {
        scale = 1.25;
        translateY = 15;
        forcedHeight = '745px';
    } else if (isGt800) {
        scale = 1.1;
        translateY = 25;
        forcedHeight = '595px';
    }

    useEffect(() => {
        setLogoContent(
            <FR
                color={theme.palette.text.primary60}
                cls={`pt-6px fs-4 opacity-50 fw-bold tdn`}
                onClick={() => {
                    navigate('/');
                }}>
                LANDING
            </FR>
        )
        setProfileBtnVisible(false);
        return () => {
            setLogoContent(defaultLogoContent);
            setProfileBtnVisible(true);
        };
    }, [setLogoContent, setProfileBtnVisible, theme]);

    useEffect(() => {
        if (isAuthenticated === null || !isAuthenticated) return;
        else {
            navigate('/profile');
            hideMobileMenu();
        }
    }, [isAuthenticated, navigate, hideMobileMenu]);

    if (isAuthenticated === null) return null;

    return (
        <FCAC
            h={forcedHeight}
            w={'90%'}
            mx={'auto'}
            maxW={350}>
            <Head title={`Вход`}/>

        </FCAC>
    );
};

export default SignIn;
