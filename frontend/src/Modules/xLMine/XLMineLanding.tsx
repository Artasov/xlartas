// xl/frontend/src/Modules/xLMine/xLMineLanding.tsx

import React from 'react';
import {FC, FCC, FCCS, FRCC, FRSC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import Button from "Core/components/elements/Button/Button";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {Link} from "react-router-dom";
import DonateButton from "./Donate/DonateButton";

// Пример: можно использовать кастомные пути к картинкам
// Замените на свои реальные изображения
const minecraftHero = 'https://via.placeholder.com/1200x600?text=Minecraft+Hero+Banner';
const screenshot1 = 'https://via.placeholder.com/400x250?text=Screenshot+1';
const screenshot2 = 'https://via.placeholder.com/400x250?text=Screenshot+2';
const screenshot3 = 'https://via.placeholder.com/400x250?text=Screenshot+3';

const XLMineLanding: React.FC = () => {
    const {plt} = useTheme();

    return (
        <FCC w="100%" minH="100vh" bg={plt.bg.primary} color={plt.text.primary70}>
            {/* HERO СЕКЦИЯ */}
            <FCCS style={{
                minHeight: '60vh',
                background: `url(${minecraftHero}) center/cover no-repeat`,
            }}>
                <FRCC w="100%" rounded={3} style={{
                    backgroundColor: plt.mode === 'dark'
                        ? 'rgba(0,0,0,0.4)'
                        : 'rgba(255,255,255,0.4)',
                    borderRadius: '1rem',
                    padding: '2rem'
                }}>
                    <FCC g={2} maxW={850} style={{textAlign: 'center'}}>
                        <h1 style={{fontSize: '3rem', margin: 0, lineHeight: '1.2'}}>
                            Добро пожаловать на <span style={{color: plt.text.accent}}>xLMine</span>
                        </h1>
                        <p style={{fontSize: '1.2rem'}}>
                            Лучший Minecraft-сервер, где ты можешь развиваться, строить и
                            общаться с другими игроками.
                        </p>
                        <Link to="/download-launcher" style={{textDecoration: 'none'}}>
                            <Button variant="contained" className="fw-bold gap-1" sx={{fontSize: '1rem'}}>
                                <DownloadRoundedIcon/>
                                Скачать лаунчер
                            </Button>
                        </Link>
                    </FCC>
                </FRCC>
            </FCCS>

            {/* БЛОК ФИЧ */}
            <FC w={'100%'}>
                <FCC g={2} maxW={900} mx="auto" textAlign="center">
                    <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>
                        Почему xLMine?
                    </h2>
                    <FRSC wrap g={'1rem'}>
                        <FCC w={'280px'} g={.5} p={1}
                             style={{backgroundColor: plt.bg.contrast10, borderRadius: '.5rem'}}>
                            <img src={screenshot1} alt={'Screenshot1'} style={{width: '100%', borderRadius: '.3rem'}}/>
                            <h3>Уникальные режимы</h3>
                            <p>Никакого однообразия – у нас множество разных режимов на любой вкус.</p>
                        </FCC>
                        <FCC w={'280px'} g={.5} p={1}
                             style={{backgroundColor: plt.bg.contrast10, borderRadius: '.5rem'}}>
                            <img src={screenshot2} alt="Screenshot2" style={{width: '100%', borderRadius: '.3rem'}}/>
                            <h3>Дружелюбное сообщество</h3>
                            <p>Мы ценим поддержку и сотрудничество между игроками.</p>
                        </FCC>

                        <FCC w={'280px'} g={.5} p={1}
                             style={{backgroundColor: plt.bg.contrast10, borderRadius: '.5rem'}}>
                            <img src={screenshot3} alt="Screenshot3"
                                 style={{width: '100%', borderRadius: '.3rem'}}/>
                            <h3>Стабильные сервера</h3>
                            <p>Без лагов и с заботой о вашем игровом опыте.</p>
                        </FCC>
                    </FRSC>
                </FCC>
            </FC>
            <FC bg={plt.bg.primary30}>
                <FCC g={2} maxW={900} mx={'auto'} textAlign={'center'}>
                    <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Поддержи сервер и получи плюшки</h2>
                    <p style={{maxWidth: 600}}>
                        Покупая привилегии или коины, ты не только помогаешь в развитии сервера,
                        но и получаешь дополнительные бонусы, ускоренный рост и уникальные возможности.
                    </p>
                    <FRCC g={1} wrap mt={2}>
                        <DonateButton/>
                        <Link to="/donate" style={{textDecoration: 'none'}}>
                            <Button variant="outlined" sx={{fontSize: '1.1rem'}}>
                                Поддержать сервер
                            </Button>
                        </Link>
                    </FRCC>
                </FCC>
            </FC>

            {/* ФУТЕР */}
            <footer style={{
                width: '100%',
                padding: '2rem 1rem',
                textAlign: 'center',
                backgroundColor: plt.bg.contrast20
            }}>
                <span style={{fontSize: '.9rem'}}>
                    © 2025 xLMine. All rights reserved.
                    <br/>
                    Minecraft © Mojang Studios / Microsoft
                </span>
            </footer>
        </FCC>
    );
};

export default XLMineLanding;
