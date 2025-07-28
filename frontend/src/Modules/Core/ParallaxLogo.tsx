// Modules/Core/ParallaxLogo.tsx
import React, {RefObject, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'Utils/nextRouter';
import {styled} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Button} from '@mui/material';
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

    const isGt1600 = useMediaQuery('(min-width:1600px)');
    const isGt1400 = useMediaQuery('(min-width:1400px)');
    const isGt1200 = useMediaQuery('(min-width:1200px)');
    const isGt1000 = useMediaQuery('(min-width:1000px)');
    const isGt800 = useMediaQuery('(min-width:800px)');
    const isGt600 = useMediaQuery('(min-width:600px)');
    const isGt400 = useMediaQuery('(min-width:400px)');

    let fontSize = '4.5rem';
    if (isGt1600) fontSize = '6.5rem';
    else if (isGt1400) fontSize = '6rem';
    else if (isGt1200) fontSize = '5.7rem';
    else if (isGt1000) fontSize = '5.5rem';
    else if (isGt800) fontSize = '5rem';
    else if (isGt600) fontSize = '4.8rem';
    else if (isGt400) fontSize = '4.7rem';

    const handleAuthClick = useCallback(() => {
        isAuthenticated ? navigate('/profile') : dispatch(openAuthModal());
    }, [isAuthenticated, navigate, dispatch]);

    const handleSoftwareClick = useCallback(() => {
        navigate('/softwares');
    }, [navigate]);

    const handleXlMineClick = useCallback(() => {
        navigate('/xlmine');
    }, [navigate]);

    const handleAboutClick = useCallback(() => {
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
                        className={`fw-bold pt-7px hover-scale-3 ${isGt1400 ? 'fs-5 px-3' : isGt400 ? 'fs-6 px-3' : 'px-2'}`}
                        onClick={handleAuthClick}>
                        {isAuthenticated ? t('profile') : t('sign_in')}
                    </Button>
                </FCCC>
                {/* Кнопка "Software" */}
                <FCCC pos="absolute" zIndex={22} left="6.6%" top="27%">
                    <Button
                        className={`fw-bold pt-7px hover-scale-5 ${isGt1400 ? 'fs-5 px-3' : 'fs-6 px-2'}`}
                        onClick={handleSoftwareClick}>
                        {t('softwares')}
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
                                height: isGt1200 ? 30 : 23,
                            }} alt="xlmine"/>
                            <img
                                src={logoText.src}
                                style={{
                                    position: 'absolute',
                                    left: 0, top: 0,
                                    height: isGt1200 ? 30 : 23,
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
                                    height: isGt1200 ? 30 : 23,
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
                            isGt1400
                                ? 'fs-6 px-3 pt-4px'
                                : isGt1000
                                    ? 'fs-7 px-3 pt-4px'
                                    : 'fs-7 px-2 pt-2px pb-0'
                        }`}
                        onClick={handleAboutClick}>
                        {t('about')}
                    </Button>
                </FCCC>
                {/* Блок SocialOAuth */}
                <FCCC pos="absolute" zIndex={22} right={isGt1400 ? '9%' : '4%'} bottom={isGt1400 ? '41%' : '42%'}>
                    <SocialOAuth className="frcc mt-2"/>
                </FCCC>
            </FCCC>
        </ParallaxContainer>
    );
};

export default React.memo(ParallaxLogo);
