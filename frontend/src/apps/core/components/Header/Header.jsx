import React, {useEffect, useRef} from 'react';
import logo from '../../static/img/art-square-logo.png';
import './header.css';
import UserAvatar from "../user/UserAvatar";
import HeaderNavigationMenu from "./HeaderNavigationMenu";
import {useAuth} from "../auth/useAuth";
import {useLocation} from "react-router-dom";
import {useTheme} from "../Theme/ThemeContext";
import ThemeToggleButton from "../Theme/ThemeToggleButton";
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LogoutIcon from '@mui/icons-material/Logout';
import {useStyles} from "../Theme/useStyles";
import {useSelector} from "react-redux";

export const headerHeight = 80;
const Header = ({navigate}) => {
    const headerRef = useRef(null);
    const headerNavRef = useRef(null);
    const btnToggleMenuRef = useRef(null);
    const {user, isAuthenticated, logout, showLoginModal} = useAuth();
    const location = useLocation();
    const {nextBackground} = useTheme();
    const classes = useStyles();
    const isHeaderVisible = useSelector((state) => state.visibility.isHeaderVisible);


    const handleClickHomePage = () => {
        navigate('/');
    };

    const toggleMobileMenu = () => {
        headerRef.current.classList.toggle('header-mobile-menu-active');
    };

    const hideMobileMenu = () => {
        headerRef.current.classList.remove('header-mobile-menu-active');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerNavRef.current && !headerNavRef.current.contains(event.target) && !btnToggleMenuRef.current.contains(event.target)) {
                hideMobileMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    if (!isHeaderVisible) return null;
    return (
        <header ref={headerRef} className={`frcc gap-4 px-4`} style={{height: headerHeight}}>
            {(!isAuthenticated || (location.pathname !== '/' && isAuthenticated)) && (
                <div onClick={handleClickHomePage} className="logo_container frcc gap-2" style={{marginTop: 2}}>
                    <UserAvatar width={45} height={45}
                                userImage={isAuthenticated ? user.avatar : logo}
                                className={(isAuthenticated && !user.avatar) ? `${classes.textPrimary}` : ''}/>
                    <span
                        className={`header-username fw-bold fs-3`}>{isAuthenticated ? user.username : 'xlartas'}</span>
                </div>
            )}
            <div className={'frcc gap-4'} style={{marginTop: "5px"}}>
                <HeaderNavigationMenu ref={headerNavRef} onHideMenu={hideMobileMenu}/>
                <div className="header-tools frcc gap-3">
                    {!isAuthenticated && <button className="fw-7" onClick={showLoginModal}>Sign in</button>}
                    <ThemeToggleButton/>
                    <WallpaperIcon onClick={nextBackground}/>
                    <div ref={btnToggleMenuRef} className="btn-toggle-header-mobile-menu"
                         onClick={toggleMobileMenu}>
                        <span className={`${classes.bgContrast90}`}></span>
                        <span className={`${classes.bgContrast90}`}></span>
                        <span className={`${classes.bgContrast90}`}></span>
                    </div>
                    {isAuthenticated && <LogoutIcon onClick={logout}/>}
                </div>
            </div>
        </header>
    );
};

export default Header;
