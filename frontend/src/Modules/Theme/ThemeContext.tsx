// Modules/Theme/ThemeContext.tsx
"use client";
// Modules/Theme/ThemeContext.tsx
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Palette, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {darkTheme, lightTheme} from "../../theme";
import {useApi} from "Api/useApi";

interface ThemeContextType {
    theme: any;
    toggleTheme: () => void;
    nextBackground: () => void;
    themeLoading: boolean;
    plt: Palette | any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

interface BackgroundImages {
    dark: string[];
    light: string[];
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const [theme, setTheme] = useState(darkTheme);
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [backgroundImages, setBackgroundImages] = useState<BackgroundImages>({dark: [], light: []});
    const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
    const [themeLoading, setThemeLoading] = useState<boolean>(true);
    const {api} = useApi();
    const processTheme = async () => {
        try {
            const data = await api.get('/api/v1/themes/');
            const darkImages = data.filter((theme: any) => theme.mode === 'dark').map((theme: any) => theme.bg_image);
            const lightImages = data.filter((theme: any) => theme.mode === 'light').map((theme: any) => theme.bg_image);
            setBackgroundImages({dark: darkImages, light: lightImages});

            const defaultTheme = data.find((theme: any) => theme.is_default);
            if (defaultTheme) {
                setThemeMode(defaultTheme.mode);
                setTheme(defaultTheme.mode === 'dark' ? darkTheme : lightTheme);
                setCurrentBackgroundIndex(defaultTheme.bg_image ? 0 : -1);
            }
        } catch (_) {
        }
        setThemeLoading(false);
    }

    useEffect(() => {
        const savedThemeMode = localStorage.getItem('themeMode');
        const savedDarkBackgroundIndex = parseInt(localStorage.getItem('darkBackgroundIndex') || '0', 10);
        const savedLightBackgroundIndex = parseInt(localStorage.getItem('lightBackgroundIndex') || '0', 10);

        if (savedThemeMode) {
            setThemeMode(savedThemeMode as 'light' | 'dark');
            setTheme(savedThemeMode === 'dark' ? darkTheme : lightTheme);
            setCurrentBackgroundIndex(
                savedThemeMode === 'dark'
                    ? savedDarkBackgroundIndex
                    : savedLightBackgroundIndex
            );
            setThemeLoading(false); // Добавлено
        } else {
            processTheme().then();
        }
    }, []);

    useEffect(() => {
        const bgImageElement = document.querySelector('.bg-image') as HTMLImageElement;
        const appElement = document.querySelector('.App') as HTMLElement;
        const backgroundImage = backgroundImages[themeMode][currentBackgroundIndex];

        if (backgroundImage) {
            bgImageElement.src = backgroundImage;
            bgImageElement.style.display = 'block';
            appElement.style.background = '';
        } else {
            bgImageElement.removeAttribute('src');
            bgImageElement.style.display = 'none';
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
            ? parseInt(localStorage.getItem('darkBackgroundIndex') || '0', 10)
            : parseInt(localStorage.getItem('lightBackgroundIndex') || '0', 10);
        setCurrentBackgroundIndex(newBackgroundIndex);
    };

    const nextBackground = () => {
        if (backgroundImages[themeMode].length > 0) {
            const nextIndex = (currentBackgroundIndex + 1) % backgroundImages[themeMode].length;
            setCurrentBackgroundIndex(nextIndex);
            if (themeMode === 'dark') {
                localStorage.setItem('darkBackgroundIndex', nextIndex.toString());
            } else {
                localStorage.setItem('lightBackgroundIndex', nextIndex.toString());
            }
        }
    };
    const plt = theme.palette
    return (
        <ThemeContext.Provider value={{theme, toggleTheme, nextBackground, themeLoading, plt}}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
