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
import FormExample from './components/examples/FormExample';
import {ThemeProvider} from "@mui/material";
import Software from "./pages/Software/Software";
import Deposit from "./components/base/Payment/Deposit";
import SoftwareDetail from "./pages/Software/SoftwareDetail";

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
                                    <Route path="/example_form" element={<FormExample/>}/>

                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/deposit/" element={<Deposit/>}/>
                                    <Route path="/software/" element={<Software/>}/>
                                    <Route path="/software/:softwareName/" element={<SoftwareDetail/>}/>
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