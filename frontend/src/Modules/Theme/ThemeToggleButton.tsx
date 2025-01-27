// Theme/ThemeToggleButton.tsx
import React from 'react';
import {useTheme} from "./ThemeContext";
import {Brightness4, Brightness7} from '@mui/icons-material';

interface ThemeToggleButtonProps {
    className?: string;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({className}) => {
    const {theme, toggleTheme} = useTheme();
    return (theme.palette.mode === 'dark'
        ? <Brightness7 className={className} style={{color: theme.palette.text.primary60}} onClick={toggleTheme}/>
        : <Brightness4 className={className} style={{color: theme.palette.text.primary60}} onClick={toggleTheme}/>);
};

export default ThemeToggleButton;
