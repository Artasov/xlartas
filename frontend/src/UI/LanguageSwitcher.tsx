import {MenuItem, Select} from '@mui/material';
import React, {useContext} from 'react';
import {LangCtx} from 'Core/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const {lang, setLang} = useContext(LangCtx);
    return (
        <Select
            size="small"
            variant="standard"
            value={lang}
            onChange={e => setLang(e.target.value as any)}
            sx={{minWidth: 70}}
        >
            <MenuItem value="ru">RU</MenuItem>
            <MenuItem value="en">EN</MenuItem>
        </Select>
    );
};
export default LanguageSwitcher;
