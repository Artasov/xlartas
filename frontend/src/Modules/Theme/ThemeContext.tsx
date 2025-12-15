// Modules/Theme/ThemeContext.tsx
"use client";
// Modules/Theme/ThemeContext.tsx
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Palette, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {darkTheme, lightTheme} from "../../theme";
import {useThemeApi} from 'Theme/useThemeApi';

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
    const {getThemes} = useThemeApi();
    const processTheme = async () => {
        try {
            const data = await getThemes();
            const darkImages = data.filter((item: any) => item.mode === 'dark').map((item: any) => item.bg_image);
            const lightImages = data.filter((item: any) => item.mode === 'light').map((item: any) => item.bg_image);
            setBackgroundImages({dark: darkImages, light: lightImages});

            const defaultTheme = data.find((item: any) => item.is_default && item.bg_image);
            if (defaultTheme) {
                const images = defaultTheme.mode === 'dark' ? darkImages : lightImages;
                const index = images.indexOf(defaultTheme.bg_image);
                setCurrentBackgroundIndex(index >= 0 ? index : 0);
            } else {
                setCurrentBackgroundIndex(-1);
            }
        } catch (_) {
        }
        setThemeLoading(false);
    }

    useEffect(() => {
        processTheme().then();
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

    const toggleTheme = useCallback(() => {
        const newThemeMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newThemeMode);
        setTheme(newThemeMode === 'dark' ? darkTheme : lightTheme);
        localStorage.setItem('themeMode', newThemeMode);
        const newBackgroundIndex = newThemeMode === 'dark'
            ? parseInt(localStorage.getItem('darkBackgroundIndex') || '0', 10)
            : parseInt(localStorage.getItem('lightBackgroundIndex') || '0', 10);
        setCurrentBackgroundIndex(newBackgroundIndex);
    }, [themeMode]);

    const nextBackground = useCallback(() => {
        if (backgroundImages[themeMode].length > 0) {
            const nextIndex = (currentBackgroundIndex + 1) % backgroundImages[themeMode].length;
            setCurrentBackgroundIndex(nextIndex);
            if (themeMode === 'dark') {
                localStorage.setItem('darkBackgroundIndex', nextIndex.toString());
            } else {
                localStorage.setItem('lightBackgroundIndex', nextIndex.toString());
            }
        }
    }, [backgroundImages, currentBackgroundIndex, themeMode]);
    const plt = useMemo(() => theme.palette, [theme]);
    const value = useMemo(() => ({theme, toggleTheme, nextBackground, themeLoading, plt}), [theme, toggleTheme, nextBackground, themeLoading, plt]);
    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
