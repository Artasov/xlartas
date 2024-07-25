// useAuth.js
import { useContext } from 'react';
import { AuthContext } from "./AuthContext";
import axiosInstance, { DOMAIN_URL } from "./axiosConfig";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    const updateCurrentUser = async () => {
        const userResponse = await axiosInstance.get('/api/current_user/');
        context.setUser(userResponse.data);
    }

    const login = async (username, password) => {
        console.log('LOGIN START')
        const response = await axiosInstance.post('/api/token/', { username, password });
        console.log('LOGIN RESPONSE')
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
        context.setUntilAuth(false);
        console.log('LOGIN END')
    };

    const google_oauth2 = async (code) => {
        const response = await axios.get(
            `${DOMAIN_URL}/accounts/google/oauth2/callback/?code=${code}`
        );
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
        context.setUntilAuth(false);
        navigate('/');
    };

    const discord_oauth2 = async (code) => {
        const response = await axios.get(
            `${DOMAIN_URL}/accounts/discord/oauth2/callback/?code=${code}`
        );
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
        context.setUntilAuth(false);
        navigate('/');
    };

    return { ...context, updateCurrentUser, login, google_oauth2, discord_oauth2 };
};