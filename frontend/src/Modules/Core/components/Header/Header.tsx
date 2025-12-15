// Modules/Core/components/Header/Header.tsx
"use client";
import React, {useRef} from 'react';
import {useAuth} from "Auth/AuthContext";
import {Link, useLocation, useNavigate} from "Utils/nextRouter";
import {useSelector} from "react-redux";
import type {RootState} from "Redux/store";
import {useTheme} from "Theme/ThemeContext";
import UserAvatar from "User/UserAvatar";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import MobileNavigationMenu from "Core/components/Header/MobileNavigationMenu";
import AdminLink from "Core/components/AdminLink";
import LogsLink from "Core/components/LogsLink";
import DesktopNavigationMenu from "Core/components/Header/DesktopNavigationMenu";
import {FR, FRBC, FRCC} from "wide-containers";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";
import {IconButton} from "@mui/material";
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import LanguageSwitcher from "../../../../UI/LanguageSwitcher";

const Header: React.FC = () => {
    const {
        toggleMobileMenu,
        headerRef,
        mobileNavigationContent,
        desktopNavigationContent,
        hideMobileMenu,
        profileBtnVisible,
        logoContent,
        mobileMenuEnabled,
        headerNavHeight,
        desktopMenuEnabled
    } = useNavigation();
    const btnToggleMenuRef = useRef<HTMLDivElement>(null);
    const {user, isAuthenticated, logout} = useAuth();
    const location = useLocation();
    const {plt} = useTheme();
    const isHeaderVisible = useSelector((state: RootState) => state.visibility.isHeaderVisible);
    const navigate = useNavigate();
    // Теперь не привязываемся к медиазапросу, а показываем меню по состоянию.
    // При желании разработчик может сам управлять состоянием mobileMenuEnabled и desktopMenuEnabled
    // прямо из компонента или контекста.

    if (!isHeaderVisible) return null;
    return (
        <FRBC w={'100%'} mx={'auto'} maxW={750} g={3} pl={1} pr={2} ref={headerRef}
              sx={{height: headerNavHeight}} component={'header'}>
            <FRCC>
                <IconButton onClick={() => {
                    navigate(-1);
                }} sx={{opacity: '50%', transform: 'scale(1.3)'}}>
                    <ArrowBackIosNewRoundedIcon/>
                </IconButton>
                <FRCC onClick={hideMobileMenu} color={plt.text.primary}>
                    {logoContent}
                </FRCC>
            </FRCC>
            <FRCC g={3} mt={'5px'}>
                {desktopMenuEnabled && desktopNavigationContent && (
                    <DesktopNavigationMenu cls={'ms-auto'}>
                        {desktopNavigationContent}
                    </DesktopNavigationMenu>
                )}
                {mobileMenuEnabled && mobileNavigationContent && (
                    <>
                        <MobileNavigationMenu>
                            {mobileNavigationContent}
                        </MobileNavigationMenu>
                        <FRCC cls={'header-tools'}>
                            <div ref={btnToggleMenuRef} className="btn-toggle-header-mobile-menu"
                                 onClick={toggleMobileMenu}>
                                <span style={{backgroundColor: plt.text.primary + '77'}}></span>
                                <span style={{backgroundColor: plt.text.primary + '77'}}></span>
                                <span style={{backgroundColor: plt.text.primary + '77'}}></span>
                            </div>
                        </FRCC>
                    </>
                )}
                <FRCC g={1}>
                    {isAuthenticated === null && <FR h={35} w={35} pos={'relative'}>
                        <CircularProgressZoomify in size={'35px'}/>
                    </FR>}
                    <LanguageSwitcher/>
                    {profileBtnVisible && !location.pathname.includes('/profile') && (
                        <Link to={'/profile'}> <UserAvatar
                            size={user?.avatar ? '37px' : '30px'}
                            className={`fs-1`}
                            avatar={user?.avatar}
                        /> </Link>
                    )}
                    {isAuthenticated && user?.is_staff && <>
                        <AdminLink/>
                        <LogsLink/>
                    </>}
                    {/*<ThemeToggleButton/>*/}
                    {isAuthenticated && <LogoutRoundedIcon
                        style={{
                            color: plt.text.primary,
                            fontSize: '1.8rem'
                        }}
                        onClick={logout}
                    />}
                </FRCC>
            </FRCC>
        </FRBC>
    );
};

export default Header;
