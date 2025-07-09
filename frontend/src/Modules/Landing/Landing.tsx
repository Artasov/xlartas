// Modules/Landing/Landing.tsx
import React, {useEffect, useState} from 'react';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {FCCC} from 'wide-containers';
import ParallaxLogo from 'Core/ParallaxLogo';
import Footer from "Landing/Footer";
import Zoom from '@mui/material/Zoom';

const Landing: React.FC = () => {
    const {
        defaultLogoContent,
        setLogoContent,
        setDesktopNavigationContent,
        setMobileNavigationContent,
        setProfileBtnVisible
    } = useNavigation();

    /* ------- анимация появления ------- */
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setTimeout(() => setAnimate(true), 200);
    }, []);

    /* ------- очистка навигации ------- */
    useEffect(() => {
        setLogoContent('');
        setDesktopNavigationContent('');
        setMobileNavigationContent('');
        setProfileBtnVisible(false);

        return () => {
            setLogoContent(defaultLogoContent);
            setProfileBtnVisible(true);
        };
    }, [
        defaultLogoContent,
        setLogoContent,
        setDesktopNavigationContent,
        setMobileNavigationContent,
        setProfileBtnVisible
    ]);

    return (
        <>
            <Zoom in={animate} appear timeout={2000}>
                <FCCC pos="relative" w="100%" h="100%">
                    <ParallaxLogo/>
                </FCCC>
            </Zoom>
            <Footer/>
        </>
    );
};

export default Landing;
