import 'moment/locale/ru';
import moment from "moment";
import './Static/css/base.sass';
import pprint from "Utils/pprint";
import './Static/css/wide-classes.css';
import Cabinet from "Cabinet/Cabinet";
import './Static/css/ReactToastify.sass';
import Head from "Core/components/Head";
import './Static/css/bootstrap_overwrite.sass';
import SettingsTool from "Core/SettingsTool";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import OrderTemplate from "Order/OrderTemplate";
import NewPassword from "Core/pages/NewPassword";
import {HelmetProvider} from "react-helmet-async";
import React, {useContext, useEffect} from 'react';
import {ProfileProvider} from "User/ProfileContext";
import OAuthCallback from "Auth/Social/OAuthCallback";
import store, {RootState} from "Redux/store";
import {ThemeProvider, useTheme} from "Theme/ThemeContext";
import {ErrorProvider} from "Core/components/ErrorProvider";
import {Provider, useSelector} from "react-redux";
import {HeaderProvider, useNavigation} from "Core/components/Header/HeaderProvider";
import {AuthContext, AuthContextType, AuthProvider} from 'Auth/AuthContext';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Landing from "Landing/Landing";
import Header from "Core/components/Header/Header";
import GlobalAuthModal from "Auth/GlobalAuthModal";
import CompanyPage from "Company/CompanyPage";
import CompanyDocumentDetail from "Company/CompanyDocumentDetail";
import {FC, FCCC} from "WideLayout/Layouts";
import CircularProgress from "Core/components/elements/CircularProgress";
import Softwares from "./Modules/Software/Softwares";
import SoftwareDetail from "./Modules/Software/SoftwareDetail";

function CompanyPublicDocuments(props: { companyName: "xlartas" }) {
    return null;
}

const App: React.FC = () => {
    const isHeaderVisible = useSelector((state: RootState) => state.visibility.isHeaderVisible);
    const {theme} = useTheme();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {headerNavHeight, mainRef} = useNavigation();

    useEffect(() => {
        moment.locale('en');
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
                theme={theme.palette.mode}
                className={`disable-tap-select`}
            />
            <div
                className={`App h-100 fc disable-tap-select`}
                style={{
                    color: theme.palette.text.primary70,
                    backgroundColor: theme.palette.bg.primary
                }}
            >
                <div className="bg-image-wrapper">
                    <img src="" className="bg-image" alt="Background"/>
                </div>
                <Head/>
                <Header/>
                <SettingsTool/>
                <GlobalAuthModal/>
                <main className={`overflow-y-auto no-scrollbar w-100`}
                      ref={mainRef} style={{
                    minHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                    maxHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                }}>
                    {isAuthenticated === null && <FCCC h={'80%'}>
                        <CircularProgress size={'100px'}/>
                    </FCCC>}
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

                        <Route path="/softwares" element={<FC g={2} p={2} mx={'auto'} maxW={800}>
                            <h1 className={'fs-1 lh-1 text-center'}>Softwares</h1>
                            <Softwares/>
                        </FC>}/>
                        <Route path="/softwares/:id" element={<FC g={2} p={2} mx={'auto'} maxW={700}>
                            <SoftwareDetail/>
                        </FC>}/>

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
                    <ProfileProvider>
                        <ErrorProvider>
                            <ThemeProvider>
                                <HelmetProvider>
                                    <App/>
                                </HelmetProvider>
                            </ThemeProvider>
                        </ErrorProvider>
                    </ProfileProvider>
                </AuthProvider>
            </HeaderProvider>
        </Router>
    </Provider>
);

export default RootApp;
