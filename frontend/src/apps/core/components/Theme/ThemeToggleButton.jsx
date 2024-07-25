import React from 'react';
import {useTheme} from "./ThemeContext";
import {Brightness4, Brightness7} from '@mui/icons-material';

const ThemeToggleButton = () => {
    const {theme, toggleTheme} = useTheme();

    return (<>
        {theme.palette.mode === 'dark'
            ? <Brightness7 onClick={toggleTheme}/>
            : <Brightness4 onClick={toggleTheme}/>}
    </>);
};

export default ThemeToggleButton;
