// Core/components/elements/CircularProgress.tsx
import React from 'react';
import {CircularProgress as CP} from "@mui/material";
import {useTheme} from "Theme/ThemeContext";


interface CircularProgressProps {
    size: number | string;
    sx?: React.CSSProperties;
}

const CircularProgress: React.FC<CircularProgressProps> = ({size, sx}) => {
    const {theme} = useTheme();
    return (
        <div className={'h-100 w-100 fccc'}>
            <CP size={size}
                style={{color: theme.palette.text.primary40, ...sx}}/>
        </div>
    );
};

export default CircularProgress;
