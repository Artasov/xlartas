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
import Modal from "Core/components/elements/Modal/Modal";
import AuthForm from "Auth/forms/AuthForm";
import CompanyPage from "Company/CompanyPage";
import CompanyDocumentDetail from "Company/CompanyDocumentDetail";
import {FC, FCCC} from "WideLayout/Layouts";
import CircularProgress from "Core/components/elements/CircularProgress";

function CompanyPublicDocuments(props: { companyName: "xlartas" }) {
    return null;
}

const App: React.FC = () => {
    const isHeaderVisible = useSelector((state: RootState) => state.visibility.isHeaderVisible);
    const {theme} = useTheme();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;

    // Берем mainRef и headerNavHeight из контекста
    const {headerNavHeight, mainRef, isAuthModalOpen, setIsAuthModalOpen} = useNavigation();

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
                <Modal closeBtn={false} title={''}
                       clsModalScroll={'px-3 '}
                       isOpen={isAuthModalOpen} cls={'w-100 maxw-380px'}
                       onClose={() => setIsAuthModalOpen(false)}>
                    <FC mb={20}>
                        <AuthForm ways={['social', 'password', 'email']}/>
                    </FC>
                </Modal>
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
