// useAuth.js
import {useContext} from 'react';
import {AuthContext} from "./AuthContext/AuthContext";
import axiosInstance, {DOMAIN_URL} from "../../../services/base/axiosConfig";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    const updateCurrentUser = async () => {
        const userResponse = await axiosInstance.get('/api/current_user/');
        context.setUser(userResponse.data);
    }

    const login = async (username, password) => {
        const response = await axios.post('/api/token/', {username, password});
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
    };

    const google_oauth2 = async (code) => {
        const response = await axios.get(
            `${DOMAIN_URL}/accounts/google/oauth2/callback/?code=${code}`
        );
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
        navigate('/');
    }

    const discord_oauth2 = async (code) => {
        const response = await axios.get(
            `${DOMAIN_URL}/accounts/discord/oauth2/callback/?code=${code}`
        );
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        await updateCurrentUser();
        navigate('/');
    }

    return {...context, updateCurrentUser, login, google_oauth2, discord_oauth2};
};