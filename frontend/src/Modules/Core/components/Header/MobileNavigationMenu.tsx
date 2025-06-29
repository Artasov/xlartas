// Modules/Core/components/Header/MobileNavigationMenu.tsx
import React, {forwardRef, ReactNode} from 'react';
import {useNavigation} from 'Core/components/Header/HeaderProvider';
import {useTheme} from 'Theme/ThemeContext';

interface MobileNavigationMenuProps {
    children: ReactNode;
}

const MobileNavigationMenu = forwardRef<HTMLElement, MobileNavigationMenuProps>(
    ({children}, _ref) => {
        const {headerNavRef} = useNavigation();
        const {plt} = useTheme();

        return (
            <nav
                className="header-nav overflow-hidden fs-5 fccc flex-md-row"
                ref={headerNavRef}
                style={{
                    height: 0,
                    zIndex: 20,
                    gap: '20px',
                }}
            >
                {children}
            </nav>
        );
    }
);

export default MobileNavigationMenu;
