// Modules/Core/components/Header/DesktopNavigationMenu.tsx
import React, {ReactNode} from "react";
import {useTheme} from "Theme/ThemeContext";

interface DesktopNavigationMenuProps {
    children: ReactNode;
    cls?: string;
}

const DesktopNavigationMenu: React.FC<DesktopNavigationMenuProps> = (
    {children, cls}) => {
    const {plt} = useTheme();
    return (
        <nav
            className={`${cls} desktop-nav frcc gap-4`}
            style={{
                zIndex: 20,
            }}>
            {children}
        </nav>
    );
};

export default DesktopNavigationMenu;
