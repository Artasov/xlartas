import React from 'react';
import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import {FCCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {useTranslation} from 'react-i18next';

interface FeatureItem {
    name: string;
    description: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

const plugins: FeatureItem[] = [
    {name: 'xlmine-server-core', description: 'внутренняя «сердцевина» сервера, все уникальные фичи'},
    {name: 'AuctionGUIPlus', description: 'внутриигровой аукцион с GUI'},
    {name: 'AxTrade', description: 'безопасный обмен предметами между игроками'},
    {name: 'AxRewards', description: 'ежедневные/ивентовые награды, поощрения за он-лайн'},
    {name: 'И другие...', description: ''},
];

const mods: FeatureItem[] = [
    {name: 'Античит', description: 'Не покажу какой'},
    {name: 'xl PvP', description: 'кастомный мод: «обратный» PvP-баланс 1.8 (кд ударов, крит-страфы)'},
    {name: 'c2me', description: 'многопоточная генерация чанков, разгрузка мира во время TPS-пиков'},
    {name: 'Applied Energistics 2', description: 'сетевые МЭ-хранилища, автокрафт'},
    {name: 'Industrial Foregoing', description: 'продвинутые фермы, механизмы, авто-ресурсы'},
    {name: 'Biomes O’ Plenty', description: 'десятки новых биомов'},
    {name: 'Regions Unexplored', description: 'расширенная генерация ландшафтов и структур'},
    {name: 'AdditionalStructures / Structory', description: 'заброшенные руины, лагеря, деревни'},
    {name: 'Mutant Monsters, Creeper Overhaul, Enderman Overhaul', description: 'новые/улучшенные мобы'},
    {name: 'Automobility & Immersive Aircraft', description: 'наземный и воздушный транспорт'},
    {name: 'Open Parties & Claims', description: 'приваты, кланы, совместное строительство'},
    {name: 'Xaero’s Minimap + World Map', description: 'мини-карта и полноэкранная карта'},
    {name: 'Sodium + Lithium + FerriteCore + ModernFix', description: 'пакет оптимизаций FPS и памяти'},
    {name: 'Useful Backpacks', description: 'вместительные рюкзаки с автосортировкой'},
    {name: 'ItemPhysic', description: 'реалистичное поведение и физика предметов'},
    {name: 'Automated Ruins: Philips Ruins', description: 'ещё больше тематических строений'},
    {name: 'Ambient Sounds', description: 'объёмный саунд-дизайн биомов и пещер'},
];

const XLMineFeaturesDialog: React.FC<Props> = ({open, onClose}) => {
    const {theme, plt} = useTheme();
    const {t} = useTranslation();

    const renderItem = (item: FeatureItem, idx: number) => (
        <li key={idx}>
            <span style={{color: theme.colors.primary.main}}>{item.name}</span>
            {item.description && (
                <> — <span style={{color: plt.text.secondary}}>{item.description}</span></>
            )}
        </li>
    );

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{textAlign: 'center', fontSize: '2rem'}}>
                xlmine
            </DialogTitle>
            <DialogContent>
                <FCCC g={2}>
                    <p>{t('xlmine_description')}</p>
                    <h3>{t('xlmine_plugins')}</h3>
                    <ul>{plugins.map(renderItem)}</ul>
                    <h3>{t('xlmine_mods')}</h3>
                    <ul>{mods.map(renderItem)}</ul>
                    <p>Всего установлено 205 модов.</p>
                </FCCC>
            </DialogContent>
        </Dialog>
    );
};

export default XLMineFeaturesDialog;
