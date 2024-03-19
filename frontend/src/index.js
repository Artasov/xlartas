import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {GoogleOAuthProvider} from '@react-oauth/google'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId='7224594722-0c7m3b3ud8thtliee2gvhphjbu3e9c0l.apps.googleusercontent.com'>
            <App/>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

// reportWebVitals(console.log);
