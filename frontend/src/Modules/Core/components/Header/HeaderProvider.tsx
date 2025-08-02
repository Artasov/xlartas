// Modules/Core/components/Header/HeaderProvider.tsx
"use client";
// Modules/Core/components/Header/HeaderProvider.tsx
import React, {createContext, ReactNode, RefObject, useContext, useRef, useState,} from 'react';
import Logo from 'Core/Logo';
import {useNavigate} from 'Utils/nextRouter';

interface HeaderContextType {
    mobileNavigationContent: ReactNode | null;
    desktopNavigationContent: ReactNode | null;
    defaultLogoContent: ReactNode | null;
    mobileMenuEnabled: boolean;
    desktopMenuEnabled: boolean;
    setMobileNavigationContent: (content: ReactNode) => void;
    setDesktopNavigationContent: (content: ReactNode) => void;
    toggleMobileMenu: () => void;
    hideMobileMenu: () => void;
    showMobileMenu: () => void;
    enableMobileMenu: () => void;
    disableMobileMenu: () => void;
    enableDesktopMenu: () => void;
    disableDesktopMenu: () => void;
    headerNavRef: RefObject<HTMLElement>;
    headerRef: RefObject<HTMLDivElement>;
    headerNavHeight: number;
    setHeaderNavHeight: (height: number) => void;
    profileBtnVisible: boolean;
    setProfileBtnVisible: (visible: boolean) => void;
    logoContent: ReactNode;
    setLogoContent: (content: ReactNode) => void;
    mainRef: RefObject<HTMLDivElement>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useNavigation = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useNavigation must be used within a HeaderProvider');
    }
    return context;
};

interface HeaderProviderProps {
    children: ReactNode;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({children}) => {
    const [mobileNavigationContent, setMobileNavigationContent] = useState<ReactNode | null>(null);
    const [desktopNavigationContent, setDesktopNavigationContent] = useState<ReactNode | null>(null);
    const [mobileMenuEnabled, setMobileMenuEnabled] = useState<boolean>(true);
    const [desktopMenuEnabled, setDesktopMenuEnabled] = useState<boolean>(true);

    const headerRef = useRef<HTMLDivElement>(null);
    const headerNavRef = useRef<HTMLElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const [headerNavHeight, setHeaderNavHeight] = useState<number>(70);
    const [profileBtnVisible, setProfileBtnVisible] = useState<boolean>(true);
    const navigate = useNavigate();

    const defaultLogoContent = (
        <Logo
            onClick={() => {
                navigate('/');
            }}
            height={45}
        />
    );
    const [logoContent, setLogoContent] = useState<ReactNode>(defaultLogoContent);

    const openMenu = () => {
        if (headerNavRef.current) {
            headerNavRef.current.style.height = 'auto';
            const contentHeight = headerNavRef.current.scrollHeight + 50;
            headerNavRef.current.style.height = '0';
            setTimeout(() => {
                if (headerNavRef.current) {
                    headerNavRef.current.style.height = `${contentHeight}px`;
                }
            }, 0);
        }
    };

    const closeMenu = () => {
        if (headerNavRef.current) headerNavRef.current.style.height = '0';
    };

    const toggleMobileMenu = () => {
        if (!mobileNavigationContent || !mobileMenuEnabled) return;
        if (headerRef.current && headerNavRef.current) {
            headerRef.current.classList.toggle('header-mobile-menu-active');
            if (headerRef.current.classList.contains('header-mobile-menu-active')) {
                openMenu();
            } else {
                closeMenu();
            }
        }
    };

    const hideMobileMenu = () => {
        if (headerRef.current && headerNavRef.current) {
            headerRef.current.classList.remove('header-mobile-menu-active');
            closeMenu();
        }
    };

    const showMobileMenu = () => {
        if (!mobileMenuEnabled) return;
        if (headerRef.current && headerNavRef.current) {
            headerRef.current.classList.add('header-mobile-menu-active');
            openMenu();
        }
    };

    const enableMobileMenu = () => setMobileMenuEnabled(true);
    const disableMobileMenu = () => {
        hideMobileMenu();
        setMobileMenuEnabled(false);
    };
    const enableDesktopMenu = () => setDesktopMenuEnabled(true);
    const disableDesktopMenu = () => setDesktopMenuEnabled(false);

    return (
        <HeaderContext.Provider
            value={{
                mobileNavigationContent,
                desktopNavigationContent,
                defaultLogoContent,
                mobileMenuEnabled,
                desktopMenuEnabled,
                setMobileNavigationContent,
                setDesktopNavigationContent,
                toggleMobileMenu,
                hideMobileMenu,
                showMobileMenu,
                enableMobileMenu,
                disableMobileMenu,
                enableDesktopMenu,
                disableDesktopMenu,
                headerNavRef,
                headerRef,
                headerNavHeight,
                setHeaderNavHeight,
                profileBtnVisible,
                setProfileBtnVisible,
                logoContent,
                setLogoContent,
                mainRef,
            }}
        >
            {children}
        </HeaderContext.Provider>
    );
};
