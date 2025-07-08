// Modules/Cabinet/Cabinet.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from "Theme/ThemeContext";
import {useMediaQuery} from "@mui/material";
import CabinetNavLink from "./CabinetNavLink";
import {useProfile} from "User/ProfileContext";
import NavLink from "Core/components/Header/NavLink";
import {FC, FCCC, FCSC, FCSS, FRC} from "wide-containers";
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
import CircularProgress from "Core/components/elements/CircularProgress";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import DeveloperBoardRoundedIcon from '@mui/icons-material/DeveloperBoardRounded';
import MinecraftVersionsManager from "../xLMine/MinecraftVersionsManager";
import MacrosExecutorPage from "../Software/Macros/MacrosExecutorPage";
import SettingsRemoteRoundedIcon from '@mui/icons-material/SettingsRemoteRounded';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import Storage from '../FileHost/Storage';

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
    const {t} = useTranslation();
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
    const [cabinetMaxWidth, setCabinetMaxWidth] = useState<string>("845px");
    const {notAuthentication} = useErrorProcessing();

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
                    {t('profile')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/softwares', true)}
                         to="/software" icon={<WebhookIcon/>}>
                    {t('software')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/licenses', true)} to="/licenses"
                         icon={<EarbudsRoundedIcon/>}>
                    {t('licenses')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/xlmine-release', true)} to="/xlmine-release"
                         icon={<DeveloperBoardRoundedIcon/>}>
                    {t('releases')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/wireless', true)} to="/wireless"
                         icon={<SettingsRemoteRoundedIcon/>}>
                    {t('wireless')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/orders', true)}
                         to="/orders" icon={<CreditScoreRoundedIcon/>}>
                    {t('orders')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/storage/master/', true)}
                         to="/storage/master" icon={<FeedRoundedIcon/>}>
                    {t('storage')}
                </NavLink>
                <NavLink onClick={() => handleMenuLinkClick('/xlmine', true)}
                         to="/xlmine" icon={<ViewInArIcon/>}>
                    {t('minecraft')}
                </NavLink>
            </>);
        } else {
            setProfileBtnVisible(false);
            setLogoContent(
                <Logo
                    onClick={() => {
                        navigate('/');
                    }}
                    height={45} cls={''}
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
        if (isAuthenticated === false) notAuthentication();
    }, [isAuthenticated]);

    if (isAuthenticated === null) return <FCCC h={'80%'}>
        <CircularProgress size={'100px'}/>
    </FCCC>;
    if (!isAuthenticated) return <FCCC h={'80%'}>
        <span>{t('need_login')}</span>
    </FCCC>;

    return (
        <CabinetWidthContext.Provider value={{cabinetMaxWidth, setCabinetMaxWidth}}>
            <FC maxW={cabinetMaxWidth}
                mx={'auto'} h={'100%'} w={'100%'}>
                <FRC h={'100%'} w={'100%'} scroll={'y-hidden'} maxH={`calc(100vh - ${headerNavHeight}px)`}>
                    <FCSC minW={'fit-content'} scroll={'y-auto'}
                          cls={'no-scrollbar d-none d-sm-flex'} pl={3} pr={3} py={'1rem'} g={1}
                          display={isGtSm ? 'flex' : 'none'}>
                        <FCSC g={1}>
                            <FC pos={'relative'}>
                                <UserAvatarEditable size={'8em'}/>
                            </FC>
                        </FCSC>
                        <FC g={1}>
                            <CabinetNavLink
                                text={t('profile')} iconSx={{transform: 'scale(1.2)'}} to="/profile"
                                urlActiveMark={'profile'}
                                icon={PersonOutlineRoundedIcon}
                                onClick={() => handleMenuLinkClick('/profile')}/>
                            <CabinetNavLink
                                text={t('software')} iconSx={{transform: 'scale(1.04)'}} to="/softwares"
                                urlActiveMark={'software'}
                                icon={WebhookIcon} onClick={() => handleMenuLinkClick('/softwares')}/>
                            <CabinetNavLink
                                text={t('licenses')} iconSx={{transform: 'scale(1.04)'}} to="/licenses"
                                urlActiveMark={'license'}
                                icon={EarbudsRoundedIcon} onClick={() => handleMenuLinkClick('/licenses')}/>
                            {user?.roles?.includes('MINE-DEV') && <CabinetNavLink
                                text={t('releases')} iconSx={{transform: 'scale(1.04)'}} to="/xlmine-release"
                                urlActiveMark={'xlmine-release'}
                                icon={DeveloperBoardRoundedIcon}
                                onClick={() => handleMenuLinkClick('/xlmine-release')}/>}
                            <CabinetNavLink
                                text={t('wireless')} to="/wireless" urlActiveMark={'wireless'}
                                icon={SettingsRemoteRoundedIcon}
                                onClick={() => handleMenuLinkClick('/wireless')}/>
                            <CabinetNavLink
                                text={t('orders')} to="/orders" urlActiveMark={'order'} icon={CreditScoreRoundedIcon}
                                onClick={() => handleMenuLinkClick('/orders')}/>
                            <CabinetNavLink
                                text={t('storage')} to="/storage/master" urlActiveMark={'storage'}
                                icon={FeedRoundedIcon}
                                onClick={() => handleMenuLinkClick('/storage/master')}/>
                            <CabinetNavLink
                                text={t('minecraft')} iconSx={{transform: 'scale(1.04)'}} to="/xlmine"
                                urlActiveMark={'xlmine'}
                                icon={ViewInArIcon} onClick={() => handleMenuLinkClick('/xlmine')}/>
                        </FC>
                    </FCSC>

                    <FC cls={'profile-section'} rounded={3} h={'100%'} w={'100%'} pos={'relative'}
                        maxH={`calc(100vh - ${headerNavHeight}px)`}
                        bg={isGtSm
                            ? plt.mode === 'dark'
                                ? plt.text.primary + '05'
                                : ''
                            : ''
                        }
                        ref={cabinetContainerRef}>
                        <Routes>
                            <Route path="profile/*" element={
                                <Profile selectedProfile={selectedProfile ? selectedProfile : 'client'}/>
                            }/>
                            <Route path="/softwares" element={<FCSS g={2} p={2}>
                                <Softwares/>
                            </FCSS>}/>
                            <Route path="/softwares/:id" element={<SoftwareDetail/>}/>
                            <Route path='/licenses' element={<Licenses/>}/>
                            <Route path='/wireless' element={<MacrosExecutorPage/>}/>
                            <Route path='/xlmine-release' element={<MinecraftVersionsManager/>}/>
                            <Route path='/storage/*' element={<Storage/>}/>

                            <Route path="/orders" element={<FCSS scroll={'y-auto'} g={1} pt={2} p={1}>
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
