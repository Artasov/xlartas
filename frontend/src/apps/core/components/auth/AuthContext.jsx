// AuthContext/AuthContext.jsx
import React, {createContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import axiosInstance from "./axiosConfig";
import SignInModal from "./SignInModal";
import {useNavigate} from "react-router-dom";
import {Message} from "../Message";
import {hideLoginModal, setUntilAuth, showLoginModal} from "../../../../redux/modalSlice";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const {isLoginModalOpen, untilAuth} = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('FIND CURRENT USER')
        const access = localStorage.getItem('access');
        if (access) {
            axiosInstance.get('/api/current_user/')
                .then(response => setUser(response.data))
                .catch(() => {
                    dispatch(showLoginModal({untilAuth: true}));
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                });
        }
    }, [dispatch]);

    const frontendLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        dispatch(showLoginModal());
    };

    const forceLogin = () => {
        dispatch(showLoginModal({untilAuth: true}));
    };

    const logout = () => {
        axiosInstance.post('/api/logout/')
            .then(response => {
                frontendLogout();
                Message.success('Logout success.');
            })
            .catch(() => {
                Message.error('Logout error.');
            });
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated: user === null ? null : !!user,
            isLoginModalOpen,
            showLoginModal: () => dispatch(showLoginModal()),
            hideLoginModal: () => dispatch(hideLoginModal()),
            setUntilAuth: (value) => dispatch(setUntilAuth(value)),
            logout,
            frontendLogout,
            forceLogin
        }}>
            {!user &&
                <SignInModal navigate={navigate} isOpen={isLoginModalOpen}/>
            }
            {children}
        </AuthContext.Provider>
    );
};
