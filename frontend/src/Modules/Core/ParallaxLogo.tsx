// Modules/Core/ParallaxLogo.tsx
"use client";
import React, {RefObject, useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'Utils/nextRouter';
import {styled} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Button} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import SocialOAuth from 'Auth/Social/components/SocialOAuth';
import Logo from 'Core/Logo';
import {FCCC, FR} from 'wide-containers';
import {useNavigation} from 'Core/components/Header/HeaderProvider';
import {useAuth} from 'Auth/AuthContext';
import ParallaxContainer from './ParallaxContainer';
import {openAuthModal} from 'Redux/modalsSlice';
import {useDispatch} from 'react-redux';
import {useTheme} from 'Theme/ThemeContext';

import logoText from 'Static/img/xlmine/logo_text.png';

type StyledH1Props = {
    fontSize: string;
};

const StyledH1 = styled('h1')<StyledH1Props>(({theme, fontSize}) => ({
    color: theme.palette.text.primary,
    fontFamily: '"Roboto Mono", serif',
    fontWeight: 300,
    margin: 0,
    fontSize,
    transition: 'font-size 0.3s ease, transform 0.2s ease',
    willChange: 'transform',
}));

const ParallaxLogo: React.FC = () => {
    const {t} = useTranslation();
    const {mainRef} = useNavigation();
    const {isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {plt} = useTheme();
    const [loading, setLoading] = useState<null | 'profile' | 'softwares' | 'about' | 'xlmine'>(null);

    const isGt1600 = useMediaQuery('(min-width:1600px)');
    const isGt1400 = useMediaQuery('(min-width:1400px)');
    const isGt1200 = useMediaQuery('(min-width:1200px)');
    const isGt1000 = useMediaQuery('(min-width:1000px)');
    const isGt800 = useMediaQuery('(min-width:800px)');
    const isGt600 = useMediaQuery('(min-width:600px)');
    const isGt400 = useMediaQuery('(min-width:400px)');

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const mqGt1600 = isMounted && isGt1600;
    const mqGt1400 = isMounted && isGt1400;
    const mqGt1200 = isMounted && isGt1200;
    const mqGt1000 = isMounted && isGt1000;
    const mqGt800 = isMounted && isGt800;
    const mqGt600 = isMounted && isGt600;
    const mqGt400 = isMounted && isGt400;

    let fontSize = '4.5rem';
    if (mqGt1600) fontSize = '6.5rem';
    else if (mqGt1400) fontSize = '6rem';
    else if (mqGt1200) fontSize = '5.7rem';
    else if (mqGt1000) fontSize = '5.5rem';
    else if (mqGt800) fontSize = '5rem';
    else if (mqGt600) fontSize = '4.8rem';
    else if (mqGt400) fontSize = '4.7rem';

    const handleAuthClick = useCallback(() => {
        if (isAuthenticated) {
            setLoading('profile');
            navigate('/profile');
        } else {
            dispatch(openAuthModal());
        }
    }, [isAuthenticated, navigate, dispatch]);

    const handleSoftwareClick = useCallback(() => {
        setLoading('softwares');
        navigate('/softwares');
    }, [navigate]);

    const handleXlMineClick = useCallback(() => {
        setLoading('xlmine');
        navigate('/xlmine');
    }, [navigate]);

    const handleAboutClick = useCallback(() => {
        setLoading('about');
        navigate('/companies/XLARTAS');
    }, [navigate]);

    return (
        <ParallaxContainer parallaxRef={mainRef as RefObject<HTMLElement>} factor={0.05}>
            <FCCC w="min-content" pos="relative" mt={-10} maxW="100%">
                <Logo width="100%" cls="w-100 ms-3 maxw-700"/>
                <StyledH1 fontSize={fontSize}>XLARTAS</StyledH1>
                {/* Кнопка "Sign in" / "Profile" */}
                <FCCC pos="absolute" zIndex={22} right="6.7%" bottom="32%">
                    <Button
                        className={`fw-bold pt-7px hover-scale-3 ${mqGt1400 ? 'fs-5 px-3' : mqGt400 ? 'fs-6 px-3' : 'px-2'}`}
                        onClick={handleAuthClick}
                        disabled={loading === 'profile'}
                        aria-busy={loading === 'profile'}>
                        {loading === 'profile' && isAuthenticated ? (
                            <FR g={1}>
                                <CircularProgress size={16} />
                                <span>{t('profile')}</span>
                            </FR>
                        ) : (
                            isAuthenticated ? t('profile') : t('sign_in')
                        )}
                    </Button>
                </FCCC>
                {/* Кнопка "Software" */}
                <FCCC pos="absolute" zIndex={22} left="6.6%" top="27%">
                    <Button
                        className={`fw-bold pt-7px hover-scale-5 ${mqGt1400 ? 'fs-5 px-3' : 'fs-6 px-2'}`}
                        onClick={handleSoftwareClick}
                        disabled={loading === 'softwares'}
                        aria-busy={loading === 'softwares'}>
                        {loading === 'softwares' ? (
                            <FR g={1}>
                                <CircularProgress size={16} />
                                <span>{t('softwares')}</span>
                            </FR>
                        ) : t('softwares')}
                    </Button>
                </FCCC>
                {/* Кнопка "xlmine" */}
                <FCCC pos="absolute" zIndex={22} right="6.6%" top="35%">
                    <FR cls="hover-scale-5" onClick={handleXlMineClick}>
                        <FR pos="relative" sx={{
                            transition: 'all 300ms ease-in-out',
                            '&:hover': {filter: 'hue-rotate(50deg)'}
                        }}>
                            <img src={logoText.src} style={{
                                height: mqGt1200 ? 30 : 23,
                            }} alt="xlmine"/>
                            <img
                                src={logoText.src}
                                style={{
                                    position: 'absolute',
                                    left: 0, top: 0,
                                    height: mqGt1200 ? 30 : 23,
                                    filter: 'blur(82px)',
                                    opacity: '60%',
                                    willChange: 'filter'
                                }}
                                alt="xlmine"
                            />
                            <img
                                src={logoText.src}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: mqGt1200 ? 30 : 23,
                                    filter: 'blur(5px)',
                                    opacity: '60%',
                                    willChange: 'filter'
                                }}
                                alt="xlmine"
                            />
                        </FR>
                    </FR>
                </FCCC>
                {/* Кнопка "About" */}
                <FCCC pos="absolute" zIndex={22} left="24%" bottom="25%">
                    <Button
                        size="small"
                        className={`fw-bold pb-3px hover-scale-5 ${
                            mqGt1400
                                ? 'fs-6 px-3 pt-4px'
                                : mqGt1000
                                    ? 'fs-7 px-3 pt-4px'
                                    : 'fs-7 px-2 pt-2px pb-0'
                        }`}
                        onClick={handleAboutClick}
                        disabled={loading === 'about'}
                        aria-busy={loading === 'about'}>
                        {loading === 'about' ? (
                            <FR g={1}>
                                <CircularProgress size={14} />
                                <span>{t('about')}</span>
                            </FR>
                        ) : t('about')}
                    </Button>
                </FCCC>
                {/* Блок SocialOAuth */}
                <FCCC pos="absolute" zIndex={22} right={mqGt1400 ? '9%' : '4%'} bottom={mqGt1400 ? '41%' : '42%'}>
                    <SocialOAuth className="frcc mt-2"/>
                </FCCC>
            </FCCC>
        </ParallaxContainer>
    );
};

export default React.memo(ParallaxLogo);
