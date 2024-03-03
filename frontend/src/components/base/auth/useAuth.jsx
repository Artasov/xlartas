// useAuth.js
import {useContext} from 'react';
import {AuthContext} from "./AuthContext/AuthContext";
import axiosInstance from "../../../services/base/axiosConfig";
import axios from "axios";

export const useAuth = () => {
    const context = useContext(AuthContext);
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

    return {...context, updateCurrentUser, login};
};