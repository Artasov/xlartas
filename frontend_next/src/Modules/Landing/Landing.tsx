// Modules/Landing/Landing.tsx
import React, {useEffect, useState} from 'react';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import Head from "Core/components/Head";
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
            <Head title={'XLARTAS'} description={'Landing page of XLARTAS platform'}/>
            <Zoom in={animate} appear timeout={2000}>
                <FCCC pos="relative" w="100%" h="100%" grow>
                    <ParallaxLogo/>
                </FCCC>
            </Zoom>
            <Footer/>
        </>
    );
};

export default Landing;
