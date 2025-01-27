// Core/components/Header/NavLink.tsx
import React from 'react';
import {Link} from 'react-router-dom';
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
    const {theme} = useTheme();

    const handleClick = () => {
        hideMobileMenu();
        if (onClick) onClick();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.button === 1) {
            e.preventDefault();
            e.stopPropagation();
            window.open(to, '_blank');
        }
    };

    return (
        <Link
            to={to}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            style={{color: theme.palette.text.primary60, ...sx, cursor: 'pointer'}}
            className={`tdn gap-1 frcc ${cls || ''}`}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
};

export default NavLink;
