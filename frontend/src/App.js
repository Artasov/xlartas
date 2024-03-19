import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
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

class App extends Component {

    render() {
        return (
            <ThemeProvider theme={darkTheme}>
                <AuthProvider>
                    <Router>
                        <div className={'App h-100 fc disable-tap-select'} data-bs-theme="dark">
                            <img src="" className="bg-image" alt=""/>

                            <Header/>
                            <main className={'overflow-y-auto no-scrollbar'}>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/deposit/" element={<Deposit/>}/>
                                    <Route path="/software/" element={<Software/>}/>
                                    <Route path="/software/:softwareName/" element={<SoftwareDetail/>}/>
                                    <Route path="/about/" element={<About/>}/>
                                    <Route path="/terms-and-conditions/" element={<TermsAndConditions/>}/>
                                    <Route path="/privacy-policy/" element={<PrivacyPolicy/>}/>
                                    <Route path="/discord-callback/" element={<DiscordOAuth/>}/>
                                    <Route path="/google-callback/" element={<GoogleOAuth/>}/>
                                </Routes>
                            </main>
                            {/*<Footer/>*/}
                        </div>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        );
    }
}

export default App;