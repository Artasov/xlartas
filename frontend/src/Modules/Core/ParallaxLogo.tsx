import React, {useContext, useEffect, useRef, useState} from 'react';
import {FCCC} from 'WideLayout/Layouts';
import Logo from "Core/Logo";
import {styled} from "@mui/material/styles";
import {useTheme} from "Theme/ThemeContext";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "Core/components/elements/Button/Button";
import SocialOAuth from "Auth/Social/components/SocialOAuth";
import {useNavigate} from "react-router-dom";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {AuthContext, AuthContextType} from "Auth/AuthContext";

// Ваш стилизованный заголовок
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

type Rotation = { rx: number; ry: number };

const ParallaxLogo: React.FC = () => {
    const {theme} = useTheme();
    const {headerNavHeight, mainRef, isAuthModalOpen, setIsAuthModalOpen} = useNavigation();

    const navigate = useNavigate();

    const {user, isAuthenticated, logout} = useContext(AuthContext) as AuthContextType;
    // Включаем mediaQuery как и было:
    const isGt1600 = useMediaQuery('(min-width:1600px)');
    const isGt1400 = useMediaQuery('(min-width:1400px)');
    const isGt1200 = useMediaQuery('(min-width:1200px)');
    const isGt1000 = useMediaQuery('(min-width:1000px)');
    const isGt800 = useMediaQuery('(min-width:800px)');
    const isGt600 = useMediaQuery('(min-width:600px)');
    const isGt400 = useMediaQuery('(min-width:400px)');

    // Параллакс-логика
    const parallaxRef = useRef<HTMLDivElement>(null);
    const [targetRotation, setTargetRotation] = useState<Rotation>({rx: 0, ry: 0});
    const [rotation, setRotation] = useState<Rotation>({rx: 0, ry: 0});

    useEffect(() => {
        let rafId: number;
        const animate = () => {
            setRotation(prev => {
                const speed = 0.1; // Чем меньше, тем плавнее
                const dx = targetRotation.rx - prev.rx;
                const dy = targetRotation.ry - prev.ry;
                return {
                    rx: prev.rx + dx * speed,
                    ry: prev.ry + dy * speed,
                };
            });
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [targetRotation]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (parallaxRef.current) {
            const rect = parallaxRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const factor = 0.04;
            setTargetRotation({
                rx: parseFloat((-y * factor).toFixed(2)),
                ry: parseFloat((x * factor).toFixed(2)),
            });
        }
    };

    // Определяем размер шрифта
    let fontSize = '4.5rem';
    if (isGt1600) fontSize = '6.5rem';
    else if (isGt1400) fontSize = '6rem';
    else if (isGt1200) fontSize = '5.7rem';
    else if (isGt1000) fontSize = '5.5rem';
    else if (isGt800) fontSize = '5rem';
    else if (isGt600) fontSize = '4.8rem';
    else if (isGt400) fontSize = '4.7rem';

    // Формируем стили вращения
    const transform = `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`;

    return (
        <FCCC w={'100%'} h={`calc(100vh - ${headerNavHeight}px)`}
              ref={parallaxRef} onMouseMove={handleMouseMove}
              style={{perspective: '1000px', overflow: 'hidden'}}>
            <FCCC w={'min-content'} pos={'relative'}
                  mt={-16} maxW={'100%'} style={{
                transform,
                transition: 'transform 0.1s ease-out',
            }}>
                <Logo width={'100%'} cls={'w-100 ms-3 maxw-700'}/>
                <StyledH1 fontSize={fontSize}>XLARTAS</StyledH1>
                {/* Кнопка "Sign in" */}
                <FCCC pos={'absolute'} zIndex={22} right={'6.6%'} bottom={'32%'}>
                    <Button className={`fw-bold pt-7px hover-scale-10 ${
                        isGt1400 ? 'fs-5 px-4' : 'fs-6 px-3'
                    }`} onClick={() => {
                        if (isAuthenticated) navigate('/profile')
                        else setIsAuthModalOpen(true)
                    }}>
                        {isAuthenticated ? 'Profile' : 'Sign in'}
                    </Button>
                </FCCC>
                {/* Блок SocialOAuth */}
                <FCCC pos={'absolute'} zIndex={22}
                      right={isGt1400 ? '9%' : '4%'} bottom={'43%'}>
                    <SocialOAuth className={'frcc mt-2  hover-scale-10'}/>
                </FCCC>
            </FCCC>
        </FCCC>
    );
};

export default ParallaxLogo;
