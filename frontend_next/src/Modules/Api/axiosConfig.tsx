// Modules/Api/axiosConfig.tsx
import axios from 'axios';

const isHttps = window.location.protocol === 'https:';
export const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID as string;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID as string;
export const YANDEX_RECAPTCHA_SITE_KEY = process.env.REACT_APP_YANDEX_RECAPTCHA_SITE_KEY as string;
export const YANDEX_CLIENT_ID = process.env.REACT_APP_YANDEX_CLIENT_ID as string;
export const VK_AUTH_CLIENT_ID = process.env.REACT_APP_VK_AUTH_CLIENT_ID as string;
export const DOMAIN = window.location.hostname;
export const DOMAIN_URL = `${isHttps ? 'https' : 'http'}://${DOMAIN}${isHttps ? '' : ':8000'}`;
export const DOMAIN_URL_ENCODED = encodeURIComponent(DOMAIN_URL);

const axiosInstance = axios.create({baseURL: `${DOMAIN_URL}/`});

function getCookie(name: string): string | null {
    if (!document.cookie) return null;
    const xsrfCookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(`${name}=`));
    if (xsrfCookies.length === 0) return null;
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
    return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
    }
    throw error;
});

export {axiosInstance as axios};
