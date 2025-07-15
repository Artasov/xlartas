// Modules/xLMine/XLMineLanding.tsx

import React, {useEffect, useRef, useState} from 'react';
import {FC, FCA, FCC, FCCC, FCSC, FR, FRCC, FRSC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import minecraftHero from 'Static/img/xlmine/hero-bg.webp';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {Button, Dialog, DialogContent, DialogTitle, useMediaQuery} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";
import {useDispatch} from 'react-redux';
import {hideBackgroundFlicker, showBackgroundFlicker} from 'Redux/visibilitySlice';
import {useTranslation} from 'react-i18next';

// Пример: можно использовать кастомные пути к картинкам
// Замените на свои реальные изображения
const screenshot1 = 'https://via.placeholder.com/400x250?text=Screenshot+1';
const screenshot2 = 'https://via.placeholder.com/400x250?text=Screenshot+2';
const screenshot3 = 'https://via.placeholder.com/400x250?text=Screenshot+3';

const plugins = [
    'xlmine-server-core — внутренняя «сердцевина» сервера, все уникальные фичи',
    'AuctionGUIPlus — внутриигровой аукцион с GUI',
    'AxTrade — безопасный обмен предметами между игроками',
    'AxRewards — ежедневные/ивентовые награды, поощрения за он-лайн',
    'AntiPopup — автоматический мут/кик при спаме и рекламе',
    'И другие...'
];

const mods = [
    'Античит — Не покажу какой',
    'xl PvP — кастомный мод: «обратный» PvP-баланс 1.8 (кд ударов, крит-страфы)',
    'c2me — многопоточная генерация чанков, разгрузка мира во время TPS-пиков',
    'Applied Energistics 2 — сетевые МЭ-хранилища, автокрафт',
    'Industrial Foregoing — продвинутые фермы, механизмы, авто-ресурсы',
    'Biomes O’ Plenty — десятки новых биомов',
    'Regions Unexplored — расширенная генерация ландшафтов и структур',
    'AdditionalStructures / Structory — заброшенные руины, лагеря, деревни',
    'Mutant Monsters, Creeper Overhaul, Enderman Overhaul — новые/улучшенные мобы',
    'Automobility & Immersive Aircraft — наземный и воздушный транспорт',
    'Open Parties & Claims — приваты, кланы, совместное строительство',
    'Xaero’s Minimap + World Map — мини-карта и полноэкранная карта',
    'Sodium + Lithium + FerriteCore + ModernFix — пакет оптимизаций FPS и памяти',
    'Useful Backpacks — вместительные рюкзаки с автосортировкой',
    'ItemPhysic — реалистичное поведение и физика предметов',
    'Automated Ruins: Philips Ruins — ещё больше тематических строений',
    'Ambient Sounds — объёмный саунд-дизайн биомов и пещер'
];

const XLMineLanding: React.FC = () => {
    const {plt, theme} = useTheme();
    const {headerNavHeight, mainRef} = useNavigation();
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const angleRef = useRef(0);
    const mouseOffsetRef = useRef({x: 0, y: 0});
    const [loading, setLoading] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    // Настройки параллакса
    const MOVE_PERCENT = 25;   // усиление движения мышью
    const AUTO_PERCENT = 5;    // автоматическое движение

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
        const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
        const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;
        mouseOffsetRef.current = {x: xNorm, y: yNorm};
    };

    useEffect(() => {
        dispatch(hideBackgroundFlicker());
        return () => {
            dispatch(showBackgroundFlicker());
        };
    }, [dispatch]);

    useEffect(() => {
        const animate = () => {
            angleRef.current += 0.002;
            const autoX = Math.cos(angleRef.current);
            const autoY = Math.sin(angleRef.current);

            // комбинируем мув мышью и авто-движение
            const x = mouseOffsetRef.current.x * MOVE_PERCENT + autoX * AUTO_PERCENT;
            const y = mouseOffsetRef.current.y * MOVE_PERCENT + autoY * AUTO_PERCENT;

            if (containerRef.current) {
                containerRef.current.style.backgroundPosition = `${40 + x}% ${50 + y}%`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
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
             color={plt.text.primary + '88'}>
            <FRSC cls={'gradient'} w={'100%'} h={'100%'}
                  pos={'fixed'} pEvents={false} zIndex={22}
                  top={`${headerNavHeight}px`} left={0} sx={{
                background: 'linear-gradient(' +
                    '0deg, ' +
                    `${plt.background.default} 0%, ` +
                    `${plt.background.default + '99'} 30%, ` +
                    'rgba(0, 0, 0, 0) 40%, ' +
                    'rgba(0, 0, 0, 0) 85%, ' +
                    `${plt.background.default} 100%` +
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
                    <FCSC px={2} g={1} maxW={850} style={{textAlign: 'center'}}>
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
                        <FR cls={'hover-scale-4'} color={theme.colors.primary.main} sx={{filter: 'brightness(2)'}}
                            fontWeight={'bold'} cursorPointer onClick={_ => {
                            window.open('https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html', '_blank');
                        }}>
                            <span>{t('xlmine_java_required')}</span>
                        </FR>
                        <Button onClick={handleDownload}
                                className="hover-scale-5 ftrans-200-eio"
                                sx={{
                                    fontSize: isGtSm ? '1.5rem' : '1.2rem',
                                    backdropFilter: 'blur(5px) saturate(2) brightness(4)',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        color: '#fff',
                                        backdropFilter: 'blur(5px) saturate(2) brightness(4) hue-rotate(30deg)',
                                        backgroundColor: 'transparent',
                                    },
                                }}>
                            <FRCC fontWeight={'bold'} g={1} opacity={70}>
                                {loading
                                    ? <FR mr={1}><CircularProgressZoomify in size="2.1rem"/></FR>
                                    : <DownloadRoundedIcon sx={{fontSize: '2.1rem'}}/>}
                                <span>{t('download_launcher')}</span>
                            </FRCC>
                        </Button>
                        <Button onClick={() => setFeaturesOpen(true)}
                                className="hover-scale-5 ftrans-200-eio"
                                sx={{
                                    fontSize: isGtSm ? '1.5rem' : '1.2rem',
                                    backdropFilter: 'blur(5px) saturate(2) brightness(4)',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        color: '#fff',
                                        backdropFilter: 'blur(5px) saturate(2) brightness(4) hue-rotate(30deg)',
                                        backgroundColor: 'transparent',
                                    },
                                }}>
                            <FRCC fontWeight={'bold'} g={1} opacity={70}>
                                <InfoOutlinedIcon sx={{fontSize: '2.1rem'}}/>
                                <span>{t('xlmine_features')}</span>
                            </FRCC>
                        </Button>
                        <FCCC g={2} maxW={900} mx={'auto'} textAlign={'center'}>
                            <p style={{maxWidth: 400, fontSize: '1.1rem'}}>
                                {t('xlmine_description')}
                            </p>
                            {/*<FRCC w={'fit-content'}><DonateButton/></FRCC>*/}
                        </FCCC>
                        {/*<XaeroMapModalButton/>*/}
                    </FCSC>
                    {/* ФУТЕР */}
                    <FC component={'footer'} mt={3} style={{
                        width: '100%',
                        color: '#fff',
                        textAlign: 'center',
                    }}>
                        <span style={{fontSize: '.9rem', opacity: '25%'}}>
                            {t('xlmine_footer')}
                        </span>
                    </FC>
                </FCCC>
            </FCA>
            <Dialog open={featuresOpen} onClose={() => setFeaturesOpen(false)}>
                <DialogTitle sx={{textAlign: 'center', fontSize: '2rem'}}>
                    xlmine
                </DialogTitle>
                <DialogContent>
                    <FCCC g={2}>
                        <p>{t('xlmine_description')}</p>
                        <h3>{t('xlmine_plugins')}</h3>
                        <ul>
                            {plugins.map((p, i) => (<li key={i}>{p}</li>))}
                        </ul>
                        <h3>{t('xlmine_mods')}</h3>
                        <ul>
                            {mods.map((m, i) => (<li key={i}>{m}</li>))}
                        </ul>
                        <p>Всего установлено 205 модов.</p>
                    </FCCC>
                </DialogContent>
            </Dialog>
        </FCC>
    );
};

export default XLMineLanding;
