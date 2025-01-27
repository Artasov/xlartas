// User/Logo.tsx
import React from 'react';
import logo from '../../Static/img/icon/logo.png';
import {FC} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";

interface LogoProps {
    height?: string | number;
    width?: string | number;
    imgCls?: string;
    cls?: string;
    onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({height, width, imgCls, cls, onClick}) => {
    const {theme} = useTheme();
    return (
        <FC cls={cls} pos={'relative'}>
            <img src={logo}
                 onClick={onClick}
                 style={{
                     filter: theme.palette.mode === 'dark' ? '' : 'invert(.8)',
                     zIndex: 9,
                     height: height,
                     width: width ? width : 'unset',
                 }}
                 className={`${imgCls} logo d-inline-block align-top object-fit-cover`}
                 alt="xlartas"/>
            <img
                src={logo}
                onClick={onClick}
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    top: 0, left: 0,
                    opacity: '0.2',
                    height: height,
                    width: width ? width : 'unset',
                    filter: 'blur(17px) contrast(1.5) brightness(2.3) ' + theme.palette.mode === 'dark' ? '' : 'invert(1)',
                }}
                className={`${imgCls} logo d-inline-block align-top object-fit-cover`}
                alt="Logo"
            />
        </FC>
    );
};

export default Logo;
