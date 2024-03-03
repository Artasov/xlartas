import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${window.location.protocol}//${window.location.hostname}:8000/`,
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/'; // Adjust this as necessary
    }
    return Promise.reject(error);
});

export default axiosInstance;