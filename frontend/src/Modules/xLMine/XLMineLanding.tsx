// Modules/xLMine/XLMineLanding.tsx

import React from 'react';
import {FC, FCA, FCC, FCCC, FRCC, FRSC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import minecraftHero from 'Static/img/xlmine/hero-bg.png';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import Button from "Core/components/elements/Button/Button";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DonateButton from "./Donate/DonateButton";
// Пример: можно использовать кастомные пути к картинкам
// Замените на свои реальные изображения
const screenshot1 = 'https://via.placeholder.com/400x250?text=Screenshot+1';
const screenshot2 = 'https://via.placeholder.com/400x250?text=Screenshot+2';
const screenshot3 = 'https://via.placeholder.com/400x250?text=Screenshot+3';

const XLMineLanding: React.FC = () => {
    const {plt} = useTheme();
    const {headerNavHeight, mainRef} = useNavigation();
    const handleDownload = async () => {
        const response = await fetch('/api/v1/xlmine/launcher/latest/');
        const data = await response.json();
        window.location.href = data.file;
    };
    return (
        <FCC pos={'relative'} w="100%"
             h={`calc(100vh - ${headerNavHeight}px)`}
             maxH={`calc(100vh - ${headerNavHeight}px)`}
             bg={plt.bg.primary} color={plt.text.primary70}>
            <FRSC w={'100%'} h={'100%'}
                  pos={'fixed'} pEvents={false}
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
            <FCA h={'100%'} sx={{background: `url(${minecraftHero}) top/cover no-repeat`}}>
                <FCCC w="100%">
                    <FC g={2} maxW={850} style={{textAlign: 'center'}}>
                        <h1 style={{fontSize: '5rem', margin: 0, lineHeight: '1.2'}}>
                            <span style={{color: plt.text.accent}}>xlmine</span>
                        </h1>
                        <Button onClick={handleDownload} variant="contained"
                                className="fw-bold gap-1 hover-scale-5 ftrans-200-eio"
                                sx={{fontSize: '1.5rem'}}>
                            <DownloadRoundedIcon sx={{fontSize: '2.1rem'}}/>
                            Скачать лаунчер
                        </Button>
                        <FC py={2}>
                            <FCCC g={2} maxW={900} mx={'auto'} textAlign={'center'}>
                                <p style={{maxWidth: 400, fontSize: '1.1rem'}}>
                                    Просто мой личный сервер изначально для игры с кем то без плохого пинга,
                                    Radmin, Realms, с кучей модов и базово норм шейдерами и текстурами. На домофоне
                                    будет мало fps, модов много.
                                </p>
                                <FRCC w={'fit-content'}><DonateButton/></FRCC>
                            </FCCC>
                        </FC>
                    </FC>
                    {/* ФУТЕР */}
                    <footer style={{
                        width: '100%',
                        color: '#fff',
                        textAlign: 'center',
                    }}>
                        <span style={{fontSize: '.9rem'}}>
                            xlmine © 2025 xlartas. All rights reserved.
                        </span>
                    </footer>
                </FCCC>
            </FCA>

        </FCC>
    );
};

export default XLMineLanding;
