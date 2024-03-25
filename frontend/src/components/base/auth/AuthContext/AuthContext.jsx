// AuthContext/AuthProvider.js
import React, {createContext, useEffect, useState} from 'react';
import axiosInstance from "../../../../services/base/axiosConfig";
import SignInModal from "../SignInModal";
import {useNavigate} from "react-router-dom";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const access = localStorage.getItem('access');
        if (access) {
            axiosInstance.get('/api/current_user/')
                .then(response => setUser(response.data))
                .catch(() => {
                    setIsLoginModalOpen(true);
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
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
            {!user &&
                <SignInModal navigate={navigate} isOpen={isLoginModalOpen} onSubmit={() => setIsLoginModalOpen(false)}/>
            }
            {children}
        </AuthContext.Provider>
    );
};