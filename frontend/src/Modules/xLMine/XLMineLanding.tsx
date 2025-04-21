// Modules/xLMine/XLMineLanding.tsx

import React, {useEffect, useRef, useState} from 'react';
import {FC, FCA, FCC, FCCC, FCSC, FR, FRSC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import minecraftHero from 'Static/img/xlmine/hero-bg.png';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import Button from "Core/components/elements/Button/Button";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CircularProgress from "Core/components/elements/CircularProgress";

// Пример: можно использовать кастомные пути к картинкам
// Замените на свои реальные изображения
const screenshot1 = 'https://via.placeholder.com/400x250?text=Screenshot+1';
const screenshot2 = 'https://via.placeholder.com/400x250?text=Screenshot+2';
const screenshot3 = 'https://via.placeholder.com/400x250?text=Screenshot+3';

const XLMineLanding: React.FC = () => {
    const {plt} = useTheme();
    const {headerNavHeight, mainRef} = useNavigation();
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        const response = await fetch('/api/v1/xlmine/launcher/latest/');
        const data = await response.json();
        window.location.href = data.file;
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
        const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;
        const movePercent = 25;
        const posX = 40 + xNorm * movePercent;
        const posY = 50 + yNorm * movePercent;

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.style.backgroundPosition = `${posX}% ${posY}%`;
            }
        });
    };

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return (
        <FCC pos={'relative'} w="100%"
             h={`calc(100vh - ${headerNavHeight}px)`}
             maxH={`calc(100vh - ${headerNavHeight}px)`}
             bg={plt.bg.primary} color={plt.text.primary70}>
            <FRSC cls={'gradient'} w={'100%'} h={'100%'}
                  pos={'fixed'} pEvents={false} zIndex={22}
                  top={`${headerNavHeight}px`} left={0} sx={{
                background: 'linear-gradient(' +
                    '0deg, ' +
                    `${plt.bg.primary} 0%, ` +
                    `${plt.bg.primary + '99'} 30%, ` +
                    'rgba(0, 0, 0, 0) 40%, ' +
                    'rgba(0, 0, 0, 0) 85%, ' +
                    `${plt.bg.primary} 100%` +
                    ')',
            }}></FRSC>
            <FCA ref={containerRef} h={'100%'} sx={{
                backgroundImage: `url(${minecraftHero})`,
                backgroundSize: 'auto 150%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '40% 50%',
                transition: 'background-position 0.2s ease-out',
            }} onMouseMove={handleMouseMove}>
                <FCCC w="100%">
                    <FCSC g={2} maxW={850} style={{textAlign: 'center'}}>
                        <h1 style={{
                            fontSize: '5rem', margin: 0, lineHeight: '4rem',
                            position: 'relative', width: 'fit-content',
                        }}>
                            <span style={{
                                color: plt.text.primary,
                                opacity: '1%',
                            }}>xlmine</span>
                            <span style={{
                                color: plt.text.primary,
                                mixBlendMode: 'overlay',
                                left: 0,
                                position: 'absolute',
                            }}>xlmine</span>
                            <span style={{
                                color: plt.text.primary,
                                mixBlendMode: 'overlay',
                                left: 0,
                                position: 'absolute',
                            }}>xlmine</span>
                            <span style={{
                                color: plt.text.primary,
                                mixBlendMode: 'overlay',
                                left: 0,
                                position: 'absolute',
                            }}>xlmine</span>
                        </h1>
                        <Button onClick={handleDownload} variant="contained"
                                className="fw-bold gap-1 hover-scale-5 ftrans-200-eio" classNameOverride={' '}
                                color={'#fff1'}
                                sx={{
                                    fontSize: '1.5rem',
                                    backdropFilter: 'blur(5px) saturate(2) brightness(4)',
                                }}>
                            {loading
                                ? <FR mr={1}><CircularProgress color={plt.text.contrast + 'aa'} size="2.1rem"/></FR>
                                : <DownloadRoundedIcon sx={{fontSize: '2.1rem'}}/>
                            }
                            Скачать лаунчер
                        </Button>
                        <FCCC g={2} maxW={900} mx={'auto'} textAlign={'center'}>
                            <p style={{maxWidth: 400, fontSize: '1.1rem'}}>
                                Просто мой личный сервер изначально для игры с кем то без плохого пинга,
                                Radmin, Realms, с кучей модов и базово норм шейдерами и текстурами. На домофоне
                                будет мало fps, модов много.
                            </p>
                            {/*<FRCC w={'fit-content'}><DonateButton/></FRCC>*/}
                        </FCCC>
                    </FCSC>
                    {/* ФУТЕР */}
                    <FC component={'footer'} mt={3} style={{
                        width: '100%',
                        color: '#fff',
                        textAlign: 'center',
                    }}>
                        <span style={{fontSize: '.9rem', opacity: '25%'}}>
                            xlmine © 2025 xlartas. All rights reserved.
                        </span>
                    </FC>
                </FCCC>
            </FCA>
        </FCC>
    );
};

export default XLMineLanding;
