// Modules/Landing/Landing.tsx
import React, {useEffect} from 'react';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {FCCC} from 'wide-containers';
import ParallaxLogo from 'Core/ParallaxLogo';

const Landing: React.FC = () => {
    const {
        defaultLogoContent,
        setLogoContent,
        setDesktopNavigationContent,
        setMobileNavigationContent,
        setProfileBtnVisible
    } = useNavigation();

    useEffect(() => {
        // При монтировании очищаем все нужные элементы:
        setLogoContent('');
        setDesktopNavigationContent('');
        setMobileNavigationContent('');
        setProfileBtnVisible(false);

        // При размонтировании возвращаем дефолтное лого:
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
        <FCCC w={'100%'} h={'100%'}>
            <ParallaxLogo/>
        </FCCC>
    );
};

export default Landing;
