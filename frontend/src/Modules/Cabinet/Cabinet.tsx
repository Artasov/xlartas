// Cabinet/Cabinet.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTheme} from "Theme/ThemeContext";
import {useMediaQuery} from "@mui/material";
import CabinetNavLink from "./CabinetNavLink";
import {useProfile} from "User/ProfileContext";
import OrderTemplate from "Order/OrderTemplate";
import NavLink from "Core/components/Header/NavLink";
import {FC, FCSC, FRC} from "WideLayout/Layouts";
import UserAvatarEditable from "User/UserAvatarEditable";
import DateRangeIcon from "@mui/icons-material/DateRange";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import pprint from "Utils/pprint";
import Profile from "User/Profile";


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

export const useCabinetWidth = () => useContext(CabinetWidthContext);
// =========================================================

const Cabinet: React.FC = () => {
    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const {setMobileNavigationContent, hideMobileMenu, headerNavHeight} = useNavigation();
    const {selectedProfile, switchProfile} = useProfile();
    const isLargeScreen = useMediaQuery('(min-width: 576px)');
    const cabinetContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const {theme} = useTheme();
    const isGtSm = useMediaQuery('(min-width: 576px)');

    const [cabinetMaxWidth, setCabinetMaxWidth] = useState<string>("1220px");

    const [isLeaveConferenceModalOpen, setIsLeaveConferenceModalOpen] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);

    const handleMenuLinkClick = (path: string, closeMobile?: boolean) => {
        const isInConference = location.pathname.includes('/conference');
        if (isInConference) {
            pprint(`Confirm leave from conference -> ${path}`);
            setPendingPath(path);
            setIsLeaveConferenceModalOpen(true);
        } else {
            if (closeMobile) hideMobileMenu();
            setTimeout(() => {
                navigate(path);
                pprint(`Cabinet navigate -> ${path}`);
            }, 0);
        }
    };

    const confirmLeaveConference = () => {
        setIsLeaveConferenceModalOpen(false);
        if (pendingPath) {
            navigate(
                `${pendingPath}?for_feedback=${
                    window.location.href.split('/')[window.location.href.split('/').length - 1]
                }`
            );
        }
        setPendingPath(null);
    };
    const cancelLeaveConference = () => {
        setIsLeaveConferenceModalOpen(false);
        setPendingPath(null);
    };

    useEffect(() => {
        if (!isLargeScreen) {
            setMobileNavigationContent(<>
                <NavLink onClick={() => handleMenuLinkClick('/profile', true)}
                         to="/profile" icon={<AssignmentIndIcon/>}>
                    Профиль
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/orders', true)}
                         to="/orders" icon={<AccountBalanceWalletIcon/>}>
                    Заказы
                </NavLink>
            </>);
        }
        return () => setMobileNavigationContent(null);
    }, [setMobileNavigationContent, selectedProfile, isLargeScreen]);

    useEffect(() => {
        if (isAuthenticated === false) navigate('/auth');
        pprint('Cabinet');
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    return (
        <CabinetWidthContext.Provider value={{cabinetMaxWidth, setCabinetMaxWidth}}>
            <FC mx={'auto'} h={'100%'} w={'100%'} maxW={cabinetMaxWidth}>
                <FRC h={'100%'} w={'100%'} scroll={'y-hidden'} maxH={`calc(100vh - ${headerNavHeight}px)`}>
                    <FCSC minW={'fit-content'} scroll={'y-auto'}
                          cls={'no-scrollbar d-sm-flex d-none'} p={2} g={2}
                          display={isGtSm ? 'flex' : 'none'}>
                        <FCSC g={1}>
                            <FC pos={'relative'}>
                                <UserAvatarEditable size={'8em'}/>
                            </FC>
                            <h6 className={`fw-6 fs-5 text-wrap`} style={{color: theme.palette.text.primary70}}>
                                {user?.first_name} {user?.last_name}
                            </h6>
                        </FCSC>
                        <FC g={1}>
                            <CabinetNavLink
                                text={'Software'} to="/software" urlActiveMark={'software'}
                                icon={DateRangeIcon} onClick={() => handleMenuLinkClick('/software')}/>
                            <CabinetNavLink
                                text={'Профиль'} to="/profile" urlActiveMark={'profile'} icon={AssignmentIndIcon}
                                onClick={() => handleMenuLinkClick('/profile')}/>
                            <CabinetNavLink
                                text={'Orders'} to="/orders" urlActiveMark={'order'} icon={AccountBalanceWalletIcon}
                                onClick={() => handleMenuLinkClick('/orders')}/>

                        </FC>
                    </FCSC>

                    <FC cls={'profile-section'} rounded={3} flexGrow={1} pos={'relative'}
                        maxH={`calc(100vh - ${headerNavHeight}px)`}
                        bg={theme.palette.bg.primary} boxShadow={theme.palette.shadow.XLO005}
                        ref={cabinetContainerRef}>
                        <Routes>
                            <Route path="profile/*" element={<Profile selectedProfile={selectedProfile ? selectedProfile : 'client'}/>}/>
                            <Route path="software" element={<div>software</div>}/>
                            <Route path="software/:id" element={<div>software X</div>}/>
                            {!isAuthenticated && <>
                                <Route path="software/my/" element={<div>DONE</div>}/>
                            </>}
                            <Route path="order" element={<OrderTemplate/>}>
                                <Route index element={<Navigate to="software" replace/>}/>
                            </Route>
                        </Routes>
                    </FC>
                </FRC>
            </FC>
        </CabinetWidthContext.Provider>
    );
};

export default Cabinet;
