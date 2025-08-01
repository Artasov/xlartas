// Modules/Api/axiosConfig.tsx
import axios from 'axios';

const isClient = typeof window !== 'undefined';
const isHttps = isClient && window.location.protocol === 'https:';
export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
export const YANDEX_RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_YANDEX_RECAPTCHA_SITE_KEY as string;
export const YANDEX_CLIENT_ID = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID as string;
export const VK_AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_VK_AUTH_CLIENT_ID as string;
export const DOMAIN = isClient
  ? window.location.hostname
  : (process.env.NEXT_PUBLIC_DOMAIN as string);
export const DOMAIN_URL = isClient
  ? `${isHttps ? 'https' : 'http'}://${DOMAIN}${isHttps ? '' : ':8000'}`
  : (process.env.NEXT_PUBLIC_API_URL as string);
export const DOMAIN_URL_ENCODED = encodeURIComponent(DOMAIN_URL);

const axiosInstance = axios.create({baseURL: `${DOMAIN_URL}/`});

function getCookie(name: string): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const xsrfCookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(`${name}=`));
    if (xsrfCookies.length === 0) return null;
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

axiosInstance.interceptors.request.use(config => {
    if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('access');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
    return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401 && typeof localStorage !== 'undefined') {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
    }
    throw error;
});

export {axiosInstance as axios};
