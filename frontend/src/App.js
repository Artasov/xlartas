import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Routes, useNavigate, useParams} from 'react-router-dom';
import Header, {headerHeight} from './apps/core/components/Header/Header';
import Home from './apps/core/pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './apps/core/static/css/bootstrap_overwrite.css';
import './apps/core/static/css/style.css';
import './apps/core/static/css/wide-classes.css';
import './apps/core/static/css/base.css';
import {AuthProvider} from './apps/core/components/auth/AuthContext';
import Software from "./apps/shop/pages/Software/Software";
import Deposit from "./apps/core/components/Payment/Deposit";
import SoftwareDetail from "./apps/shop/pages/Software/SoftwareDetail";
import About from "./apps/core/pages/About";
import PrivacyPolicy from "./apps/core/pages/PrivacyPolicy";
import TermsAndConditions from "./apps/core/pages/TermsAndConditions";
import GoogleOAuth from "./apps/core/components/auth/OAuth/GoogleOAuth";
import DiscordOAuth from "./apps/core/components/auth/OAuth/DiscordOAuth";
import 'react-toastify/dist/ReactToastify.css';
import './apps/core/static/css/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import ResetPassword from "./apps/core/pages/ResetPassword";
import Offer from "./apps/core/pages/Offer";
import SurveysMainPage from "./apps/surveys/pages/SurveysMainPage";
import SurveyCreate from "./apps/surveys/pages/SurveyCreate";
import SurveyEdit from "./apps/surveys/pages/SurveyEdit";
import {ThemeProvider, useTheme} from "./apps/core/components/Theme/ThemeContext";
import {useStyles} from "./apps/core/components/Theme/useStyles";
import Survey from "./apps/surveys/pages/Survey/Survey";
import {Provider, useSelector} from "react-redux";

import store from './redux/store';
import FileHost from "./apps/filehost/components/FileHost";

function HeaderWithNavigate() {
    const navigate = useNavigate();
    return <Header navigate={navigate}/>;
}

function SurveyEditWrapper() {
    const {slug} = useParams();
    return <SurveyEdit slug={slug}/>;
}

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <ThemeProvider>
                    <Router>
                        <AuthProvider>
                            <ToastAndMain/>
                        </AuthProvider>
                    </Router>
                </ThemeProvider>
            </Provider>
        );
    }
}

const ToastAndMain = () => {
    const {theme} = useTheme();
    const classes = useStyles();
    const isHeaderVisible = useSelector((state) => state.visibility.isHeaderVisible);

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
                className={'disable-tap-select'}
            />
            <div className={`App h-100 fc disable-tap-select ${classes.textPrimary}`}>
                <div className="bg-image-wrapper">
                    <img src="" className="bg-image" alt="Background"/>
                </div>
                <HeaderWithNavigate/>
                <main className={`overflow-y-auto no-scrollbar w-100`}
                      style={{
                          paddingLeft: '1.2rem',
                          paddingRight: '1.2rem',
                          minHeight: isHeaderVisible ? `calc(100vh - ${headerHeight}px)`: '100vh',
                          maxHeight: isHeaderVisible ? `calc(100vh - ${headerHeight}px)`: '100vh',
                      }}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/about/" element={<About/>}/>
                        <Route path="/offer/" element={<Offer/>}/>
                        <Route path="/terms-and-conditions/" element={<TermsAndConditions/>}/>
                        <Route path="/privacy-policy/" element={<PrivacyPolicy/>}/>
                        <Route path="/discord-callback/" element={<DiscordOAuth/>}/>
                        <Route path="/google-callback/" element={<GoogleOAuth/>}/>
                        <Route path="/reset-password/" element={<ResetPassword/>}/>
                        <Route path="/deposit/" element={<Deposit/>}/>
                        <Route path="/software/" element={<Software/>}/>
                        <Route path="/software/:softwareName/" element={<SoftwareDetail/>}/>
                        <Route path="/surveys/:slug/" element={<Survey/>}/>
                        <Route path="/surveys/" element={<SurveysMainPage/>}/>
                        <Route path="/surveys/create/" element={<SurveyCreate/>}/>
                        <Route path="/surveys/edit/:slug/" element={<SurveyEditWrapper/>}/>
                        <Route path="/host/" element={<FileHost/>}/>
                    </Routes>
                </main>
                {/*<Footer/>*/}
            </div>
        </>
    );
};

export default App;
