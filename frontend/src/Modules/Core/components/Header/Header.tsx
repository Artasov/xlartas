// Modules/Core/components/Header/Header.tsx
import React, {useContext, useRef} from 'react';
import './Header.sass';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useTheme} from "Theme/ThemeContext";
import UserAvatar from "User/UserAvatar";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import MobileNavigationMenu from "Core/components/Header/MobileNavigationMenu";
import AdminLink from "Core/components/AdminLink";
import LogsLink from "Core/components/LogsLink";
import DesktopNavigationMenu from "Core/components/Header/DesktopNavigationMenu";
import {FR, FRBC, FRCC} from "WideLayout/Layouts";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CircularProgress from "Core/components/elements/CircularProgress";
import {IconButton} from "@mui/material";
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

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
    const {user, isAuthenticated, logout} = useContext(AuthContext) as AuthContextType;
    const location = useLocation();
    const {plt} = useTheme();
    const isHeaderVisible = useSelector((state: any) => state.visibility.isHeaderVisible);
    const navigate = useNavigate();
    // Теперь не привязываемся к медиазапросу, а показываем меню по состоянию.
    // При желании разработчик может сам управлять состоянием mobileMenuEnabled и desktopMenuEnabled
    // прямо из компонента или контекста.

    if (!isHeaderVisible) return null;
    return (
        <FRBC w={'100%'} mx={'auto'} maxW={750} g={3} pl={1} pr={2} ref={headerRef}
              sx={{height: headerNavHeight}} component={'header'}>
            <FRCC>
                <IconButton sx={{width: 30, height: 30, opacity: '50%', transform: 'scale(1.3)'}}>
                    <ArrowBackIosNewRoundedIcon onClick={()=> {
                        navigate(-1);
                    }}/>
                </IconButton>
                <FRCC onClick={hideMobileMenu} color={plt.text.primary60}>
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
                                <span style={{backgroundColor: plt.bg.contrast60}}></span>
                                <span style={{backgroundColor: plt.bg.contrast60}}></span>
                                <span style={{backgroundColor: plt.bg.contrast60}}></span>
                            </div>
                        </FRCC>
                    </>
                )}
                <FRCC g={1}>
                    {isAuthenticated === null && <CircularProgress size={'35px'}/>}
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
                            color: plt.text.primary60,
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