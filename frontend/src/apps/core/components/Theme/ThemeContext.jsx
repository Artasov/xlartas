import React, {createContext, useContext, useEffect, useState} from 'react';
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import darkTheme, {lightTheme} from "./Theme";
import axios from "axios";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children}) => {
    // const {frontendLogout} = useAuth(AuthContext);
    const [theme, setTheme] = useState(darkTheme);
    const [themeMode, setThemeMode] = useState('dark');
    const [backgroundImages, setBackgroundImages] = useState({dark: [], light: []});
    const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

    useEffect(async () => {
        try {
            const response = await axios.get('/api/themes/');
            const darkImages = response.data.filter(theme => theme.mode === 'dark').map(theme => theme.bg_image);
            const lightImages = response.data.filter(theme => theme.mode === 'light').map(theme => theme.bg_image);
            setBackgroundImages({dark: darkImages, light: lightImages});

            const defaultTheme = response.data.find(theme => theme.is_default);
            if (defaultTheme) {
                setThemeMode(defaultTheme.mode);
                setTheme(defaultTheme.mode === 'dark' ? darkTheme : lightTheme);
                setCurrentBackgroundIndex(defaultTheme.bg_image ? 0 : -1);
            }
        } catch (error) {
            console.error(error);
            // ErrorProcessing.byResponse(error, frontendLogout);
        }
    }, []);

    useEffect(() => {
        const savedThemeMode = localStorage.getItem('themeMode');
        const savedDarkBackgroundIndex = parseInt(localStorage.getItem('darkBackgroundIndex'), 10);
        const savedLightBackgroundIndex = parseInt(localStorage.getItem('lightBackgroundIndex'), 10);

        if (savedThemeMode) {
            setThemeMode(savedThemeMode);
            setTheme(savedThemeMode === 'dark' ? darkTheme : lightTheme);
            setCurrentBackgroundIndex(
                savedThemeMode === 'dark'
                    ? (savedDarkBackgroundIndex || 0)
                    : (savedLightBackgroundIndex || 0)
            );
        }
    }, []);

    useEffect(() => {
        const bgImageElement = document.querySelector('.bg-image');
        const appElement = document.querySelector('.App');
        const backgroundImage = backgroundImages[themeMode][currentBackgroundIndex];

        if (backgroundImage) {
            bgImageElement.src = backgroundImage;
            bgImageElement.style.display = 'block';
            appElement.style.background = '';
        } else {
            bgImageElement.src = '';
            bgImageElement.style.display = 'none';
            appElement.style.background = themeMode === 'dark' ? '#151515' : '#fff';
        }

        if (appElement) {
            appElement.classList.remove('_dark', '_light');
            appElement.classList.add('_' + themeMode);
        }
    }, [currentBackgroundIndex, themeMode, backgroundImages]);

    const toggleTheme = () => {
        const newThemeMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newThemeMode);
        setTheme(newThemeMode === 'dark' ? darkTheme : lightTheme);
        localStorage.setItem('themeMode', newThemeMode);
        const newBackgroundIndex = newThemeMode === 'dark'
            ? (parseInt(localStorage.getItem('darkBackgroundIndex'), 10) || 0)
            : (parseInt(localStorage.getItem('lightBackgroundIndex'), 10) || 0);
        setCurrentBackgroundIndex(newBackgroundIndex);
    };

    const nextBackground = () => {
        if (backgroundImages[themeMode].length > 0) {
            const nextIndex = (currentBackgroundIndex + 1) % backgroundImages[themeMode].length;
            setCurrentBackgroundIndex(nextIndex);
            if (themeMode === 'dark') {
                localStorage.setItem('darkBackgroundIndex', nextIndex);
            } else {
                localStorage.setItem('lightBackgroundIndex', nextIndex);
            }
        } else {
            const appElement = document.querySelector('.App');
            appElement.style.background = themeMode === 'dark' ? '#0b0b0e' : '#fff';
        }
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme, nextBackground}}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
