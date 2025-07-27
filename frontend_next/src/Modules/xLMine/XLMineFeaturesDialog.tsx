// Modules/xLMine/XLMineFeaturesDialog.tsx
import React from 'react';
import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import {FC} from 'wide-containers';
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
    {name: 'xlmine-server-core', description: 'уникальные фичи сервера'},
    {name: 'AuctionGUIPlus', description: 'аукцион с GUI'},
    {name: 'AxTrade', description: 'обмен предметами между игроками'},
    {name: 'AxRewards', description: 'ежедневные/ивентовые награды'},
    {name: 'И другие...', description: ''},
];

const mods: FeatureItem[] = [
    {name: 'Античит', description: 'Не покажу какой'},
    {name: 'xl PvP', description: 'кастомный мод: PvP-баланс 1.8'},
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
        <span key={idx}>
            <span style={{
                color: plt.text.primary + 'ff', padding: '0 7px',
                backgroundColor: plt.text.primary + '33',
                borderRadius: '5px'
            }}>
                {item.name}
            </span>
            {item.description && (
                <>
                    &nbsp;—&nbsp;<span style={{color: plt.text.primary + 'aa'}}>
                        {item.description}
                    </span>
                </>
            )}
        </span>
    );

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{fontSize: '2rem'}}>
                xlmine
            </DialogTitle>
            <DialogContent className={'no-scrollbar'}>
                <FC g={2}>
                    <p style={{margin: 0}}>{t('xlmine_description')}</p>
                    <FC g={2}>
                        <FC>
                            <h3>{t('xlmine_plugins')}</h3>
                            <FC g={.4} w={'100%'}>{plugins.map(renderItem)}</FC>
                        </FC>
                        <FC>
                            <h3>{t('xlmine_mods')}</h3>
                            <FC g={.4} w={'100%'}>{mods.map(renderItem)}</FC>
                            <p>Всего установлено 205 модов.</p>
                        </FC>
                    </FC>
                </FC>
            </DialogContent>
        </Dialog>
    );
};

export default XLMineFeaturesDialog;
