// Modules/Core/components/Header/NavLink.tsx
import React from 'react';
import {Link} from 'Utils/nextRouter';
import {useTheme} from 'Theme/ThemeContext';
import {useNavigation} from 'Core/components/Header/HeaderProvider';

interface NavLinkProps {
    to: string;
    icon?: React.ReactNode;
    sx?: React.CSSProperties;
    cls?: string;
    onClick?: () => void;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({to, icon, sx, cls, onClick, children}) => {
    const {hideMobileMenu} = useNavigation();
    const {plt} = useTheme();

    const handleClick = () => {
        hideMobileMenu();
        if (onClick) onClick();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (e.button === 1) {
            e.preventDefault();
            e.stopPropagation();
            window.open(to, '_blank');
        }
    };

    return (
        <Link to={to} onClick={handleClick}>
            <span
                onMouseDown={handleMouseDown}
                className={`tdn gap-1 frcc ${cls || ''}`}
                style={{color: plt.text.primary, ...sx, cursor: 'pointer'}}
            >
                {icon}
                <span>{children}</span>
            </span>
        </Link>
    );
};

export default NavLink;
