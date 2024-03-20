// AuthContext/AuthProvider.js
import React, {createContext, useEffect, useState} from 'react';
import axiosInstance from "../../../../services/base/axiosConfig";
import SignInModal from "../SignInModal";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            axiosInstance.get('/api/current_user/')
                .then(response => setUser(response.data))
                .catch(() => {
                    setIsLoginModalOpen(true);
                });
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        setIsLoginModalOpen(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated: !!user,
            isLoginModalOpen,
            showLoginModal: () => setIsLoginModalOpen(true),
            hideLoginModal: () => setIsLoginModalOpen(false),
            logout
        }}>
            {isLoginModalOpen && !user &&
                <SignInModal show={isLoginModalOpen} onSubmit={() => setIsLoginModalOpen(false)}/>}
            {children}
        </AuthContext.Provider>
    );
};