// Modules/Cabinet/Cabinet.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTheme} from "Theme/ThemeContext";
import {useMediaQuery} from "@mui/material";
import CabinetNavLink from "./CabinetNavLink";
import {useProfile} from "User/ProfileContext";
import NavLink from "Core/components/Header/NavLink";
import {FC, FCSC, FCSS, FRC} from "WideLayout/Layouts";
import UserAvatarEditable from "User/UserAvatarEditable";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {Route, Routes, useNavigate} from "react-router-dom";
import pprint from "Utils/pprint";
import Profile from "User/Profile";
import CreditScoreRoundedIcon from '@mui/icons-material/CreditScoreRounded';
import WebhookIcon from '@mui/icons-material/Webhook';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import UserOrders from "Order/UserOrders";
import SoftwareDetail from "../Software/SoftwareDetail";
import Softwares from "../Software/Softwares";
import Logo from "Core/Logo";
import OrderDetail from "Order/OrderDetail";
import Licenses from "../Software/Licenses";
import EarbudsRoundedIcon from '@mui/icons-material/EarbudsRounded';

// ====== ВАЖНАЯ ЧАСТЬ: создаём контекст для maxWidth ======
type CabinetWidthContextType = {
    cabinetMaxWidth: string;
    setCabinetMaxWidth: (w: string) => void;
};

const CabinetWidthContext = React.createContext<CabinetWidthContextType>({
    cabinetMaxWidth: "1220px",
    setCabinetMaxWidth: () => {
    },
});


const Cabinet: React.FC = () => {
    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const {
        setMobileNavigationContent,
        hideMobileMenu,
        headerNavHeight,
        setProfileBtnVisible,
        setLogoContent,
        defaultLogoContent
    } = useNavigation();
    const {selectedProfile, switchProfile} = useProfile();
    const cabinetContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const [cabinetMaxWidth, setCabinetMaxWidth] = useState<string>("700px");

    const handleMenuLinkClick = (path: string, closeMobile?: boolean) => {
        if (closeMobile) hideMobileMenu();
        setTimeout(() => {
            navigate(path);
            pprint(`Cabinet navigate -> ${path}`);
        }, 0);
    };

    useEffect(() => {
        if (!isGtSm) {
            setLogoContent(defaultLogoContent);
            setMobileNavigationContent(<>
                <NavLink onClick={() => handleMenuLinkClick('/profile', true)}
                         to="/profile" icon={<PersonOutlineRoundedIcon/>}>
                    Profile
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/softwares', true)}
                         to="/software" icon={<WebhookIcon/>}>
                    Software
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/licenses', true)} to="/licenses"
                         icon={<EarbudsRoundedIcon/>}>
                    Licenses
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/orders', true)}
                         to="/orders" icon={<CreditScoreRoundedIcon/>}>
                    Orders
                </NavLink>
            </>);
        } else {
            setProfileBtnVisible(false);
            setLogoContent(
                <Logo
                    onClick={() => {
                        navigate('/');
                    }}
                    height={45} cls={'ms-5 ps-4'}
                />
            )
        }
        return () => {
            setMobileNavigationContent(null)
            setLogoContent(defaultLogoContent);
            setProfileBtnVisible(true);
        };
    }, [setMobileNavigationContent, selectedProfile, isGtSm]);

    useEffect(() => {
        if (isAuthenticated === false) navigate('/?auth_modal=True');
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    return (
        <CabinetWidthContext.Provider value={{cabinetMaxWidth, setCabinetMaxWidth}}>
            <FC maxW={cabinetMaxWidth}
                mx={'auto'} h={'100%'} w={'100%'}>
                <FRC h={'100%'} w={'100%'} scroll={'y-hidden'} maxH={`calc(100vh - ${headerNavHeight}px)`}>
                    <FCSC minW={'fit-content'} scroll={'y-auto'}
                          cls={'no-scrollbar d-none d-sm-flex'} pl={3} pr={3} py={'1rem'} g={0}
                          display={isGtSm ? 'flex' : 'none'}>
                        <FCSC g={1}>
                            <FC pos={'relative'}>
                                <UserAvatarEditable size={'8em'}/>
                            </FC>
                            <h6 className={`fw-6 fs-5 text-wrap`} style={{color: plt.text.primary70}}>
                                {user?.first_name} {user?.last_name}
                            </h6>
                        </FCSC>
                        <FC g={1}>
                            <CabinetNavLink
                                text={'Profile'} iconSx={{transform: 'scale(1.2)'}} to="/profile"
                                urlActiveMark={'profile'}
                                icon={PersonOutlineRoundedIcon}
                                onClick={() => handleMenuLinkClick('/profile')}/>
                            <CabinetNavLink
                                text={'Software'} iconSx={{transform: 'scale(1.04)'}} to="/softwares"
                                urlActiveMark={'software'}
                                icon={WebhookIcon} onClick={() => handleMenuLinkClick('/softwares')}/>
                            <CabinetNavLink
                                text={'Licenses'} iconSx={{transform: 'scale(1.04)'}} to="/licenses"
                                urlActiveMark={'license'}
                                icon={EarbudsRoundedIcon} onClick={() => handleMenuLinkClick('/licenses')}/>
                            <CabinetNavLink
                                text={'Orders'} to="/orders" urlActiveMark={'order'} icon={CreditScoreRoundedIcon}
                                onClick={() => handleMenuLinkClick('/orders')}/>

                        </FC>
                    </FCSC>

                    <FC cls={'profile-section'} rounded={3} flexGrow={1} pos={'relative'}
                        maxH={`calc(100vh - ${headerNavHeight}px)`}
                        bg={isGtSm
                            ? plt.mode === 'dark'
                                ? plt.bg.contrast + '05'
                                : ''
                            : ''
                        } boxShadow={plt.shadow.XLO005}
                        ref={cabinetContainerRef}>
                        <Routes>
                            <Route path="profile/*"
                                   element={<Profile selectedProfile={selectedProfile ? selectedProfile : 'client'}/>}/>
                            <Route path="/softwares" element={<FCSS g={2} p={2}>
                                <h1 className={'fs-3 lh-1'}>Softwares</h1>
                                <Softwares/>
                            </FCSS>}/>
                            <Route path="/softwares/:id" element={<SoftwareDetail/>}/>
                            <Route path='/licenses' element={<Licenses/>}/>

                            <Route path="/orders" element={<FCSS g={1} pt={2} p={1}>
                                <h1 className={'fs-3 lh-1'}>Orders</h1>
                                <UserOrders className={'px-2'}/>
                            </FCSS>}/>
                            <Route path="orders/:id" element={<OrderDetail className={'px-3'}/>}/>
                        </Routes>
                    </FC>
                </FRC>
            </FC>
        </CabinetWidthContext.Provider>
    );
};

export default Cabinet;
