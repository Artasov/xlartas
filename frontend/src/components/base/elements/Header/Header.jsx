import React, {useEffect, useRef, useState} from 'react';
import theme_icon from '../../../../static/base/images/icons/palette.png';
import logo from '../../../../static/base/images/art-square-logo.png';
import './header.css';
import axios from 'axios';
import UserAvatar from "../../user/UserAvatar/UserAvatar";
import HeaderNavigationMenu from "./HeaderNavigationMenu/HeaderNavigationMenu";
import {useAuth} from "../../auth/useAuth";
import logoutIcon from "../../../../static/base/images/icons/logout.png";
import {useLocation, useNavigate} from "react-router-dom";

const Header = () => {
    const headerRef = useRef(null);
    const headerNavRef = useRef(null);
    const btnToggleMenuRef = useRef(null);
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
    const {user, isAuthenticated, logout, showLoginModal} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleClickHomePage = () => {
        navigate('/');
    };

    useEffect(() => {
        axios.get('/api/themes/')
            .then(response => {
                const imageUrls = response.data.map(theme => theme.bg_image);
                setBackgroundImages(imageUrls);
                const savedBackgroundIndex = localStorage.getItem('backgroundIndex') || 0;
                setCurrentBackgroundIndex(parseInt(savedBackgroundIndex, 10));
                document.querySelector('.bg-image').src = imageUrls[savedBackgroundIndex];
            })
            .catch(error => console.warn('Ошибка при загрузке изображений:', error));
    }, []);

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

    const nextTheme = () => {
        if (backgroundImages.length > 0) {
            const nextIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
            setCurrentBackgroundIndex(nextIndex);
            localStorage.setItem('backgroundIndex', nextIndex);
            document.querySelector('.bg-image').src = backgroundImages[nextIndex];
        }
    };

    return (<header ref={headerRef} className="frcc gap-4 px-4">
        {(!isAuthenticated || (location.pathname !== '/' && isAuthenticated)) && (
            <div onClick={handleClickHomePage} className="logo_container frcc gap-2" style={{marginTop: 2}}>
                <UserAvatar width={'45px'} height={'45px'}
                            userImage={isAuthenticated ? user.avatar : logo}
                            className={(isAuthenticated && user.avatar) ? '' : 'invert-80'}/>
                <span className="fw-bold fs-3 text-white-d0"
                      style={{marginTop: "1px"}}>{isAuthenticated ? user.username : 'xlartas'}</span>
            </div>
        )}
        <div className={'frcc gap-4'} style={{marginTop: "5px"}}>
            <HeaderNavigationMenu ref={headerNavRef} onHideMenu={hideMobileMenu}/>
            <div className="header-tools frcc gap-3">
                {!isAuthenticated &&
                    <button onClick={showLoginModal} className="login-button" style={{marginTop: "0px"}}>
                        Sign in
                    </button>}
                <img onClick={nextTheme} src={theme_icon} className="invert-85" width="27" height="27"
                     alt="Change theme"/>
                <div ref={btnToggleMenuRef} className="btn-toggle-header-mobile-menu invert-20"
                     onClick={toggleMobileMenu}>
                    <span></span><span></span><span></span>
                </div>
                {isAuthenticated && (
                    <img src={logoutIcon} height="22" width="22" onClick={logout} className="logout-button invert-85"
                         alt="Logout"/>
                )}
            </div>
        </div>
    </header>);
};

export default Header;
