// Modules/Core/components/elements/Divider.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";


interface DividerProps {
    height?: string;
    width?: string;
    className?: string;
}

const Divider: React.FC<DividerProps> = ({height = '1px', width = '100%', className}) => {
    const {plt} = useTheme();
    return (
        <div
            className={`${className ? className : ''} rounded-2`}
            style={{
                width: width,
                height: height,
                backgroundColor: plt.text.primary + '33'
            }}
        ></div>
    );
};

export default Divider;
