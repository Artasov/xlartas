// Modules/Core/components/Header/MobileNavigationMenu.tsx
import React, {forwardRef, ReactNode} from "react";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {useTheme} from "Theme/ThemeContext";

interface MobileNavigationMenuProps {
    children: ReactNode;
}

const MobileNavigationMenu = forwardRef<HTMLDivElement, MobileNavigationMenuProps>(({children}, _ref) => {
    const {headerNavRef} = useNavigation();
    const {theme} = useTheme();
    return (
        <nav
            className={`header-nav overflow-hidden fs-5 fccc flex-md-row`}
            ref={headerNavRef}
            style={{
                height: 0,
                zIndex: 20,
                gap: '20px',
                boxShadow: theme.palette.shadow.LO06,
                backgroundColor: theme.palette.bg.primary30
            }}>
            {children}
        </nav>
    );
});

export default MobileNavigationMenu;
