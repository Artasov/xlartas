import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import Header from './components/base/elements/Header/Header';
import Home from './pages/home/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/base/css/bootstrap_overwrite.css';
import './static/base/css/style.css';
import './static/base/css/wide-classes.css';
import './static/base/css/base.css';
import {AuthProvider} from './components/base/auth/AuthContext/AuthContext';
import {darkTheme} from './components/base/theme/Theme';
import {ThemeProvider} from "@mui/material";
import Software from "./pages/Software/Software";
import Deposit from "./components/base/Payment/Deposit";
import SoftwareDetail from "./pages/Software/SoftwareDetail";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import GoogleOAuth from "./components/base/auth/OAuth/GoogleOAuth";
import DiscordOAuth from "./components/base/auth/OAuth/DiscordOAuth";
import 'react-toastify/dist/ReactToastify.css';
import './static/base/css/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import ResetPassword from "./pages/ResetPassword";
import Offer from "./pages/Offer";

function HeaderWithNavigate() {
    const navigate = useNavigate();
    return <Header navigate={navigate}/>;
}

class App extends Component {
    render() {
        return (
            <ThemeProvider theme={darkTheme}>
                <Router>
                    <AuthProvider>
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
                            theme="dark"
                            className={'disable-tap-select'}
                        />
                        <div className={'App h-100 fc disable-tap-select'} data-bs-theme="dark">
                            <img src="" className="bg-image" alt=""/>
                            <HeaderWithNavigate/>
                            <main className={'overflow-y-auto no-scrollbar pb-5'}>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/deposit/" element={<Deposit/>}/>
                                    <Route path="/software/" element={<Software/>}/>
                                    <Route path="/software/:softwareName/" element={<SoftwareDetail/>}/>
                                    <Route path="/about/" element={<About/>}/>
                                    <Route path="/offer/" element={<Offer/>}/>
                                    <Route path="/terms-and-conditions/" element={<TermsAndConditions/>}/>
                                    <Route path="/privacy-policy/" element={<PrivacyPolicy/>}/>
                                    <Route path="/discord-callback/" element={<DiscordOAuth/>}/>
                                    <Route path="/google-callback/" element={<GoogleOAuth/>}/>
                                    <Route path="/reset-password/" element={<ResetPassword/>}/>
                                </Routes>
                            </main>
                            {/*<Footer/>*/}
                        </div>
                    </AuthProvider>
                </Router>
            </ThemeProvider>
        );
    }
}

export default App;