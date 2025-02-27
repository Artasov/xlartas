// Modules/Core/components/elements/Divider.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";


interface DividerProps {
    height?: string;
    width?: string;
    className?: string;
}

const Divider: React.FC<DividerProps> = ({height = '1px', width = '100%', className}) => {
    const {theme} = useTheme();
    return (
        <div
            className={`${className ? className : ''} rounded-2`}
            style={{
                width: width,
                height: height,
                backgroundColor: theme.palette.bg.contrast30
            }}
        ></div>
    );
};

export default Divider;
