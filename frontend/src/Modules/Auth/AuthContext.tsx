// Modules/Auth/AuthContext.tsx
import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {axios, DOMAIN_URL} from "../Api/axiosConfig";
import {useNavigate} from "react-router-dom";
import {Message} from "Core/components/Message";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {IUser} from "types/core/user";
import {JWTPair} from "types/core/auth";
import {OAUTH_PROVIDERS} from "Auth/Social/constants";
import {OAuthProvider} from "Auth/Social/types";
import pprint from "Utils/pprint";

export interface AuthContextType {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    updateCurrentUser: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    frontendLogout: () => void;
    handleAuthResponse: (jwtPair: JWTPair, next?: string) => void;
    isAuthenticated: boolean | null;
    setIsAuthenticated: (auth: boolean | null) => void;
    discord_oauth2: (code: string, next: string | null) => Promise<void>;
    google_oauth2: (code: string, next: string | null) => Promise<void>;
    vk_oauth2: (code: string, next: string | null) => Promise<void>;
    yandex_oauth2: (code: string, next: string | null) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    // Если переменная isAuthenticated !== null значит аутентификация уже была!
    // !isAuthenticated не значит, что авторизация не прошла, может она null и еще выполняется.
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {headerNavHeight, mainRef, isAuthModalOpen, setIsAuthModalOpen} = useNavigation();

    const {hideMobileMenu} = useNavigation();

    useEffect(() => {
        if (localStorage.getItem('access')) updateCurrentUser().then();
        else {
            pprint('dispatch - auth set false')
            setIsAuthenticated(false);
        }
    }, [dispatch]);

    const frontendLogout = () => {
        pprint('frontendLogout')
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        setIsAuthenticated(false);
        hideMobileMenu();
    };
    const handleAuthResponse = async (jwtPair: JWTPair, next?: string) => {
        pprint('Success Auth')
        localStorage.setItem('access', jwtPair.access);
        localStorage.setItem('refresh', jwtPair.refresh);
        await updateCurrentUser()
        const nextFromUrl = new URLSearchParams(window.location.search).get('next');
        pprint('Final auth next')
        pprint(nextFromUrl ? nextFromUrl : next ? next : '/profile')
        navigate(nextFromUrl ? nextFromUrl : next ? next : '/profile');
        hideMobileMenu();
        setIsAuthModalOpen(false);
        Message.success('Добро пожаловать! Вы успешно вошли в свой аккаунт.');
    };
    const logout = () => axios.post('/api/v1/logout/')
        .then(() => {
            frontendLogout();
            Message.success('Успешный выход из системы.');
            navigate('/');
        }).catch(() => Message.error('Ошибка выхода из системы.'));

    const updateCurrentUser = async () => {
        pprint('Update current user')
        const access = localStorage.getItem('access')
        try {
            const response = await axios.get('/api/v1/current_user/', {
                headers: {Authorization: `Bearer ${access}`}
            })
            pprint('User')
            pprint(response.data)
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (e) {
            console.error(`User error: ${e}`)
            frontendLogout()
        }
    }
    const login = async (username: string, password: string) => {
        try {
            const r = await axios.post('/api/v1/token/', {username, password})
            await handleAuthResponse(r.data)
        } catch (e) {
            Message.error('Неверный логин или пароль.')
        }
    }
    const oauth2Handler = async (provider: OAuthProvider,
                                 code: string,
                                 next: string | null = null) => {
        pprint(`OAuth2 : ${provider}`);
        try {
            const r = await axios.get(`${DOMAIN_URL}/api/v1/oauth/${provider}/callback/?code=${code}`);
            if (r.data.access && r.data.refresh) {
                await handleAuthResponse(r.data, next ? next : undefined);
            } else {
                const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                Message.success(`${capitalizeFirstLetter(provider)} аккаунт успешно привязан.`);
                updateCurrentUser().catch(console.error);
                navigate(next ? next : '/profile');
            }
        } catch {
            return Message.error(`Не удалось войти через ${provider}, свяжитесь с нами.`);
        }
    };
    const google_oauth2 = (code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.GOOGLE, code, next);
    const discord_oauth2 = (code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.DISCORD, code, next);
    const vk_oauth2 = (code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.VK, code, next);
    const yandex_oauth2 = (code: string, next: string | null = null) =>
        oauth2Handler(OAUTH_PROVIDERS.YANDEX, code, next);

    return (
        <AuthContext.Provider value={{
            user, setUser,
            updateCurrentUser,
            login, logout,
            frontendLogout,
            isAuthenticated,
            setIsAuthenticated,
            handleAuthResponse,
            discord_oauth2,
            google_oauth2,
            vk_oauth2,
            yandex_oauth2,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
