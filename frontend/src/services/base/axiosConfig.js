import axios from 'axios';

const protocol = window.location.protocol;
export const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
export const TINKOFF_TERMINAL_KEY = process.env.REACT_APP_TINKOFF_TERMINAL_KEY;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
export const DOMAIN = process.env.REACT_APP_MAIN_DOMAIN;
export const GOOGLE_RECAPTCHA_SITE_KEY = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;
export const YANDEX_RECAPTCHA_SITE_KEY = process.env.REACT_APP_YANDEX_RECAPTCHA_SITE_KEY;
export const DOMAIN_URL = `${protocol}//${DOMAIN}${protocol === 'http:' ? ':8000' : ''}`
export const DOMAIN_URL_ENCODED = encodeURIComponent(DOMAIN_URL)

const axiosInstance = axios.create({
    baseURL: `${protocol}//${DOMAIN}${window.location.protocol === 'http:' ? ':8000' : ''}/`,
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
        window.location.href = '/';
    }
    return Promise.reject(error);
});

export default axiosInstance;