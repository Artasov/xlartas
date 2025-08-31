// Modules/Auth/AuthContext.tsx
"use client";
// Modules/Auth/AuthContext.tsx
import React, {createContext, ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {useAuthApi} from 'Auth/useAuthApi';
import {useNavigate} from "Utils/nextRouter";
import {Message} from "Core/components/Message";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {IUser} from "types/core/user";
import {JWTPair} from "types/core/auth";
import {OAUTH_PROVIDERS} from "Auth/Social/constants";
import {OAuthProvider} from "Auth/Social/types";
import pprint from "Utils/pprint";
import {closeAuthModal} from "Redux/modalsSlice";

export interface AuthContextType {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    updateCurrentUser: () => Promise<void>;
    login: (username: string, password: string, next?: string) => Promise<void>;
    logout: () => void;
    frontendLogout: () => void;
    handleAuthResponse: (jwtPair: JWTPair, next?: string) => void;
    isAuthenticated: boolean | null;
    setIsAuthenticated: (auth: boolean | null) => void;
    discord_oauth2: (code: string, next: string | null) => Promise<void>;
    google_oauth2: (code: string, next: string | null) => Promise<void>;
    vk_oauth2: (code: string, next: string | null) => Promise<void>;
    yandex_oauth2: (code: string, next: string | null) => Promise<void>;
    logoutInProgress: boolean;
    setLogoutInProgress: (v: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [logoutInProgress, setLogoutInProgress] = useState<boolean>(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const {hideMobileMenu} = useNavigation();

    const {login: apiLogin, logout: apiLogout, getCurrentUser, oauthCallback} = useAuthApi();

    useEffect(() => {
        if (localStorage.getItem('access')) updateCurrentUser().then();
        else {
            pprint('dispatch - auth set false');
            setIsAuthenticated(false);
        }
    }, [dispatch]);

    const frontendLogout = React.useCallback(() => {
        pprint('frontendLogout');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        setIsAuthenticated(false);
        hideMobileMenu();
    }, [hideMobileMenu]);

    const updateCurrentUser = React.useCallback(async () => {
        pprint('Update current user');
        try {
            const data = await getCurrentUser();
            pprint('User');
            pprint(data);
            setUser(data);
            setIsAuthenticated(true);
        } catch (e) {
            console.error(`User error: ${e}`);
            frontendLogout();
        }
    }, [frontendLogout, getCurrentUser]);
    const handleAuthResponse = React.useCallback(async (jwtPair: JWTPair, next?: string) => {
        pprint('Success Auth');
        localStorage.setItem('access', jwtPair.access);
        localStorage.setItem('refresh', jwtPair.refresh);
        pprint(jwtPair);
        await updateCurrentUser();
        const nextFromUrl = new URLSearchParams(window.location.search).get('next');
        pprint('Final auth next');
        navigate(nextFromUrl ? nextFromUrl : next ? next : '/profile');
        hideMobileMenu();
        dispatch(closeAuthModal());
        Message.success(t('login_success'));
    }, [dispatch, hideMobileMenu, navigate, t, updateCurrentUser]);
    const logout = React.useCallback(() => {
        setLogoutInProgress(true);
        apiLogout()
            .then(() => {
                frontendLogout();
                Message.success(t('logout_success'));
                navigate('/');
            })
            .catch(() => Message.error(t('logout_error')))
            .finally(() => setLogoutInProgress(false));
    }, [apiLogout, frontendLogout, navigate, t]);

    
    const login = React.useCallback(async (username: string, password: string, next?: string) => {
        try {
            const r = await apiLogin(username, password);
            await handleAuthResponse(r, next);
        } catch (e) {
            Message.error(t('invalid_credentials'));
        }
    }, [apiLogin, handleAuthResponse, t]);
    const oauth2Handler = React.useCallback(async (
        provider: OAuthProvider,
        code: string,
        next: string | null = null,
    ) => {
        pprint(`OAuth2 : ${provider}`);
        try {
            const r = await oauthCallback(provider, code);
            if (r.access && r.refresh) {
                await handleAuthResponse(r, next ? next : '/profile');
            } else {
                const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                Message.success(`${capitalizeFirstLetter(provider)} аккаунт успешно привязан.`);
                updateCurrentUser().catch(e => console.error(e));
                navigate(next ? next : '/profile');
            }
        } catch {
            return Message.error(`Не удалось войти через ${provider}, свяжитесь с нами.`);
        }
    }, [handleAuthResponse, navigate, oauthCallback, updateCurrentUser]);
    const google_oauth2 = React.useCallback((code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.GOOGLE, code, next)
    , [oauth2Handler]);
    const discord_oauth2 = React.useCallback((code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.DISCORD, code, next)
    , [oauth2Handler]);
    const vk_oauth2 = React.useCallback((code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.VK, code, next)
    , [oauth2Handler]);
    const yandex_oauth2 = React.useCallback((code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.YANDEX, code, next)
    , [oauth2Handler]);

    const value = useMemo<AuthContextType>(() => ({
        user,
        setUser,
        updateCurrentUser,
        login,
        logout,
        frontendLogout,
        isAuthenticated,
        setIsAuthenticated,
        handleAuthResponse,
        discord_oauth2,
        google_oauth2,
        vk_oauth2,
        yandex_oauth2,
        logoutInProgress,
        setLogoutInProgress,
    }), [
        user,
        updateCurrentUser,
        login,
        logout,
        frontendLogout,
        isAuthenticated,
        handleAuthResponse,
        discord_oauth2,
        google_oauth2,
        vk_oauth2,
        yandex_oauth2,
        logoutInProgress,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
