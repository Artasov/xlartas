// Cabinet/CabinetNavLink.tsx
import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {SvgIconComponent} from '@mui/icons-material';
import {useTheme} from "Theme/ThemeContext";
import {FRSC} from "WideLayout/Layouts";

interface CabinetNavLinkProps {
    text: string;
    to?: string;
    urlActiveMark?: string;
    onClick?: () => void;
    icon?: SvgIconComponent;
}

const CabinetNavLink: React.FC<CabinetNavLinkProps> = ({text, to, urlActiveMark, onClick, icon: Icon}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {theme} = useTheme();
    const isActive = (urlActiveMark || to)
        ? location.pathname.includes(urlActiveMark ? urlActiveMark : to ? to : '\//\\/')
        : false;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 1 && to) {
            e.preventDefault();
            e.stopPropagation();
            window.open(to, '_blank');
        }
    };

    return (
        <FRSC g={1} py={1} px={2} rounded={3} w={'100%'}
              onMouseDown={handleMouseDown} cursorPointer
              cls={`profile-tab-item tdn hover-scale-5`}
              onClick={
                  onClick
                      ? onClick
                      : to
                          ? () => navigate(to)
                          : undefined
              }
              bg={isActive ? theme.palette.bg.contrast10 : ''}
              boxShadow={isActive ? theme.palette.shadow.MO005C : ''}
              sx={{
                  textShadow: isActive ? theme.palette.shadow.XXSO02 : '',
              }}>
            {Icon && (
                <Icon
                    className={`fs-4`}
                    style={{color: theme.palette.text.primary70}}
                />
            )}
            <span
                className={`fs-5 text-nowrap`}
                style={{color: theme.palette.text.primary70}}
            >
                {text}
            </span>
        </FRSC>
    );
};

export default CabinetNavLink;
