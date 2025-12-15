// Modules/Api/axiosConfig.tsx
// Содержит только константы конфигурации API. Сам Axios-инстанс создаётся в useApi.ts.

const isClient = typeof window !== 'undefined';
const isHttps = isClient && window.location.protocol === 'https:';

export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
export const YANDEX_RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_YANDEX_RECAPTCHA_SITE_KEY as string;
export const YANDEX_CLIENT_ID = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID as string;
export const VK_AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_VK_AUTH_CLIENT_ID as string;

// Домен приложения (c учётом порта для локалки)
export const DOMAIN = isClient
    ? window.location.host
    : (process.env.NEXT_PUBLIC_DOMAIN as string);

// Базовый URL для API:
//  • в браузере — относительный '/', чтобы в PROD ходить на тот же домен через NPM;
//  • на сервере (SSR) можно переопределить переменной окружения NEXT_INTERNAL_API_BASE (например, http://web:8000)
const SERVER_INTERNAL_API_BASE = process.env.NEXT_INTERNAL_API_BASE || '';
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
// Prefer explicit API base URLs. On client, use NEXT_PUBLIC_API_BASE when provided.
// On server (SSR/route handlers), use NEXT_INTERNAL_API_BASE when provided, falling back to the public one.
export const API_BASE_URL = isClient
    ? (PUBLIC_API_BASE || '/')
    : (SERVER_INTERNAL_API_BASE || PUBLIC_API_BASE || '/');

export const DOMAIN_URL = isClient
    ? `${isHttps ? 'https' : 'http'}://${DOMAIN}`
    : (process.env.NEXT_PUBLIC_APP_ORIGIN as string || 'http://localhost:3000');

export const DOMAIN_URL_ENCODED = encodeURIComponent(DOMAIN_URL);
