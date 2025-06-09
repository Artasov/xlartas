// Modules/Core/components/elements/Tabs/TabButton.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";
import {ContainerProps} from "wide-containers/src/Modules/Container";
import {FC, FRC} from "wide-containers";

interface TabButtonProps extends ContainerProps {
    active: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    textSx?: any;
}

const TabButton: React.FC<TabButtonProps> = (
    {
        active,
        children,
        onClick,
        textSx
    }) => {
    const {plt, theme} = useTheme();

    const styles: React.CSSProperties = {
        transition: 'all 0.3s ease-in-out',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: active ? plt.text.primary80 : plt.text.primary60,
        outline: 'none',
    };

    return (
        <FC style={styles} onClick={onClick}>
            <FRC sx={textSx}>{children}</FRC>
            <div style={{
                transition: 'all 0.3s ease-in-out',
                width: '100%',
                height: '3px',
                borderRadius: '3px',
                backgroundColor: active
                    ? theme.colors.secondary.main
                    : `${theme.colors.secondary.main}33`,
            }}></div>
        </FC>
    );
};

export default TabButton;
