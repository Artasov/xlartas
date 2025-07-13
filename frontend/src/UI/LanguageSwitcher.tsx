// UI/LanguageSwitcher.tsx
import React, {useContext} from 'react';
import {MenuItem} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import {LangCtx} from 'Core/LanguageContext';
import OptionsMenu from 'Modules/Core/components/elements/OptionsMenu';

const LanguageSwitcher: React.FC = () => {
    const {lang, setLang} = useContext(LangCtx);

    return (
        <OptionsMenu
            icon={<PublicIcon/>}
            iconClassName="p-1"
        >
            <MenuItem
                selected={lang === 'ru'}
                onClick={() => setLang('ru')}
            >
                RU
            </MenuItem>
            <MenuItem
                selected={lang === 'en'}
                onClick={() => setLang('en')}
            >
                EN
            </MenuItem>
        </OptionsMenu>
    );
};

export default LanguageSwitcher;
