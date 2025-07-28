"use client";

import 'moment/locale/ru';
import pprint from "Utils/pprint";
import Cabinet from "Cabinet/Cabinet";
import Head from "Core/components/Head";
import SettingsTool from "Core/SettingsTool";
import {ToastContainer} from "react-toastify";
import OrderTemplate from "Order/OrderTemplate";
import NewPassword from "Core/pages/NewPassword";
import {HelmetProvider} from "react-helmet-async";
import React, {useEffect} from 'react';
import {ProfileProvider} from "User/ProfileContext";
import OAuthCallback from "Auth/Social/OAuthCallback";
import store, {RootState} from "Redux/store";
import {ThemeProvider, useTheme} from "Theme/ThemeContext";
import {ErrorProvider} from "Core/components/ErrorProvider";
import {Provider, useSelector} from "react-redux";
import {HeaderProvider, useNavigation} from "Core/components/Header/HeaderProvider";
import {AuthProvider, useAuth} from 'Auth/AuthContext';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Landing from "Landing/Landing";
import Header from "Core/components/Header/Header";
import GlobalAuthModal from "Auth/GlobalAuthModal";
import CompanyPage from "Company/CompanyPage";
import CompanyDocumentDetail from "Company/CompanyDocumentDetail";
import {FC} from "wide-containers";
import Softwares from "./Modules/Software/Softwares";
import {useTranslation} from 'react-i18next';
import SoftwareDetail from "./Modules/Software/SoftwareDetail";
import XLMineLanding from "./Modules/xLMine/XLMineLanding";
import BackgroundFlicker from "Core/BackgroundFlicker";
import {LangProvider} from "Core/LanguageContext";
import Converter from "Converter/Converter";


const App: React.FC = () => {
    const isHeaderVisible = useSelector((state: RootState) => state.visibility.isHeaderVisible);
    const {plt} = useTheme();
    const {isAuthenticated} = useAuth();
    const {t} = useTranslation();
    const {headerNavHeight, mainRef} = useNavigation();
    const isGt1000 = window.innerWidth > 1000;
    const isBackgroundFlickerEnabled = useSelector((state: RootState) => state.visibility.isBackgroundFlickerEnabled);

    useEffect(() => {
        pprint('START');
    }, []);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme={plt.mode}
                className={`disable-tap-select`}
            />
            <div
                className={`App h-100 fc disable-tap-select`}
                style={{
                    color: plt.text.primary,
                    backgroundColor: plt.primary.contrastText
                }}
            >
                {isBackgroundFlickerEnabled && (
                    <BackgroundFlicker
                        count={isGt1000 ? 130 : 45}
                        stickThickness={0.3}
                        stickLength={1.5}
                        stickLengthJitter={0.5}
                        baseSize={3.2}
                        sizeJitter={0.8}
                        glowSize={2}
                        glowSizeJitter={0.4}
                        glowFraction={0.4}
                    />
                )}
                <div className="bg-image-wrapper">
                    <img className="bg-image" alt="Background"/>
                </div>
                <Head/>
                <Header/>
                <SettingsTool/>
                <GlobalAuthModal/>
                <main className={`overflow-y-auto no-scrollbar w-100 fc`}
                      ref={mainRef} style={{
                    minHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                    maxHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                }}>
                    <Routes>
                        {/* <Route path="/" element={<Navigate to={'/auth'}/>}/> */}
                        <Route path='/' element={<Landing/>}/>
                        <Route path='/new-password' element={<NewPassword/>}/>
                        <Route path='oauth/:provider/callback/' element={<OAuthCallback/>}/>

                        {isAuthenticated === null
                            ? ''
                            : isAuthenticated
                                ? ''
                                : (
                                    <>
                                        <Route path='/order' element={<OrderTemplate/>}>
                                            <Route
                                                index
                                                element={<Navigate to="software" replace/>}
                                            />
                                        </Route>
                                    </>
                                )
                        }

                        {/* Маршрут для компании */}
                        <Route path='/companies/:name' element={<CompanyPage/>}/>
                        <Route path='/docs/:id' element={<CompanyDocumentDetail/>}/>

                        {isAuthenticated === false && <>
                            <Route path="/softwares" element={<FC g={2} p={2} mx={'auto'} maxW={800}>
                                <h1 className={'fs-1 lh-1 text-center'}>{t('softwares')}</h1>
                                <Softwares/>
                            </FC>}/>
                            <Route path="/softwares/:id" element={<FC g={2} p={2} mx={'auto'} maxW={700}>
                                <SoftwareDetail/>
                            </FC>}/>
                        </>}
                        <Route path='/xlmine' element={<XLMineLanding/>}/>
                        <Route path='/converter' element={<Converter/>}/>
                        <Route path='/*' element={<Cabinet/>}/>
                    </Routes>
                </main>
            </div>
        </>
    );
};

const RootApp: React.FC = () => (
    <Provider store={store}>
        <Router>
            <HeaderProvider>
                <AuthProvider>
                    <LangProvider>
                        <ProfileProvider>
                            <ErrorProvider>
                                <ThemeProvider>
                                    <HelmetProvider>
                                        <App/>
                                    </HelmetProvider>
                                </ThemeProvider>
                            </ErrorProvider>
                        </ProfileProvider>
                    </LangProvider>
                </AuthProvider>
            </HeaderProvider>
        </Router>
    </Provider>
);

export default RootApp;
