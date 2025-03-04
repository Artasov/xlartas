// Modules/Core/ParallaxLogo.tsx
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {styled} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from 'Core/components/elements/Button/Button';
import SocialOAuth from 'Auth/Social/components/SocialOAuth';
import Logo from 'Core/Logo';
import {FCCC} from 'WideLayout/Layouts';
import {useNavigation} from 'Core/components/Header/HeaderProvider';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import ParallaxContainer from './ParallaxContainer';
import {openAuthModal} from "Redux/modalsSlice";
import {useDispatch} from "react-redux";

type StyledH1Props = {
    fontSize: string;
};

const StyledH1 = styled('h1')<StyledH1Props>(({theme, fontSize}) => ({
    color: theme.palette.text.primary85,
    fontFamily: '"Roboto Mono", serif',
    fontWeight: 300,
    margin: 0,
    fontSize,
    transition: 'font-size 0.3s ease, transform 0.2s ease',
}));

const ParallaxLogo: React.FC = () => {
    const {mainRef} = useNavigation();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Определение размера шрифта на основе медиазапросов
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

    return (
        // Оборачиваем содержимое логотипа в ParallaxContainer.
        // В качестве parallaxRef передаём ref родительского контейнера (например, mainRef),
        // от которого будем отслеживать движения мыши.
        <ParallaxContainer parallaxRef={mainRef} factor={0.1}>
            <FCCC w="min-content" pos="relative" mt={-10} maxW="100%">
                <Logo width="100%" cls="w-100 ms-3 maxw-700"/>
                <StyledH1 fontSize={fontSize}>XLARTAS</StyledH1>
                {/* Кнопка "Sign in" / "Profile" */}
                <FCCC pos="absolute" zIndex={22} right="6.6%" bottom="32%">
                    <Button
                        className={`fw-bold pt-7px hover-scale-3 ${isGt1400 ? 'fs-5 px-4' : 'fs-6 px-3'}`}
                        onClick={() => {
                            isAuthenticated ? navigate('/profile') : dispatch(openAuthModal());
                        }}>
                        {isAuthenticated ? 'Profile' : 'Sign in'}
                    </Button>
                </FCCC>
                {/* Кнопка "Software" */}
                <FCCC pos="absolute" zIndex={22} left="6.6%" top="27%">
                    <Button
                        className={`fw-bold pt-7px hover-scale-5 ${isGt1400 ? 'fs-5 px-3' : 'fs-6 px-2'}`}
                        onClick={() => navigate('/softwares')}>
                        Software
                    </Button>
                </FCCC>
                {/* Кнопка "About" */}
                <FCCC pos="absolute" zIndex={22} left="24%" bottom="25%">
                    <Button size={'small'}
                            className={`fw-bold pb-3px hover-scale-5 ${isGt1400 
                                ? 'fs-6 px-3 pt-4px' 
                                : isGt1000 
                                    ? 'fs-7 px-3 pt-4px'
                                    : 'fs-7 px-2 pt-2px pb-0'
                            }`}
                            sx={{
                            }}
                            onClick={() => navigate('/companies/XLARTAS')}>
                        About
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

export default ParallaxLogo;
