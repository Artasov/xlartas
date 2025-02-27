// Modules/Theme/ThemeToggleButton.tsx
import React from 'react';
import {useTheme} from "./ThemeContext";
import Brightness5RoundedIcon from '@mui/icons-material/Brightness5Rounded';

interface ThemeToggleButtonProps {
    className?: string;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({className}) => {
    const {theme, toggleTheme} = useTheme();
    return (theme.palette.mode === 'dark'
        ? <Brightness5RoundedIcon className={className} style={{fontSize:'1.7rem',color: theme.palette.text.primary60}}
                                  onClick={toggleTheme}/>
        : <Brightness5RoundedIcon className={className} style={{fontSize:'1.7rem',color: theme.palette.text.primary60}}
                                  onClick={toggleTheme}/>);
};

export default ThemeToggleButton;
