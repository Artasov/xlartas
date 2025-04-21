// Modules/Core/components/elements/CircularProgress.tsx
import React from 'react';
import {CircularProgress as CP} from "@mui/material";
import {useTheme} from "Theme/ThemeContext";


interface CircularProgressProps {
    size: number | string;
    sx?: React.CSSProperties;
    color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({size, sx, color}) => {
    const {plt} = useTheme();
    return (
        <div className={'h-100 w-100 fccc'}>
            <CP size={size}
                style={{...sx, color: color ? color : plt.text.primary40,}}/>
        </div>
    );
};

export default CircularProgress;
