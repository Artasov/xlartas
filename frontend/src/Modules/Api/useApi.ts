// Modules/Api/useApi.ts
"use client";
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig,} from 'axios';
import {useEffect, useRef, useContext} from 'react';
import {ErrorContextType, useErrorProcessing} from 'Core/components/ErrorProvider';
import {AuthContext} from 'Auth/AuthContext';
import {API_BASE_URL} from './axiosConfig';

type AxiosConfig = AxiosRequestConfig | undefined;

/* -------- helpers: cookies & token storage -------- */
const LS_ACCESS = 'access';
const LS_REFRESH = 'refresh';

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const xsrfCookies = document.cookie
        .split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(`${name}=`));
    if (xsrfCookies.length === 0) return null;
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
};

const saveTokens = (a: string, r: string) => {
    if (typeof document !== 'undefined') {
        document.cookie = `access=${a}; path=/`;
        document.cookie = `refresh=${r}; path=/`;
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LS_ACCESS, a);
        localStorage.setItem(LS_REFRESH, r);
    }
};

const clearTokens = () => {
    if (typeof document !== 'undefined') {
        document.cookie = 'access=; Max-Age=0; path=/';
        document.cookie = 'refresh=; Max-Age=0; path=/';
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LS_ACCESS);
        localStorage.removeItem(LS_REFRESH);
    }
};

const getAccess = () => {
    const fromCookie = typeof document !== 'undefined' ? getCookie('access') : null;
    if (fromCookie) return fromCookie;
    return typeof localStorage !== 'undefined' ? localStorage.getItem(LS_ACCESS) : null;
};
const getRefresh = () => {
    const fromCookie = typeof document !== 'undefined' ? getCookie('refresh') : null;
    if (fromCookie) return fromCookie;
    return typeof localStorage !== 'undefined' ? localStorage.getItem(LS_REFRESH) : null;
};

/* -------- stringify / preview helper (для логов) -------- */
const fmt = (x: unknown) => {
    // для строк — аккуратно обрезаем, для всего остального возвращаем как есть
    if (typeof x === 'string') {
        return x.length > 500 ? `${x.slice(0, 497)}...` : x;
    }
    return x; // объект/массив/ошибка попадут в консоль «живыми»
};

export const useApi = () => {
    let byResponse: ErrorContextType['byResponse'] = (err) => console.error(err);
    try {
        ({byResponse} = useErrorProcessing());
    } catch {
        // ErrorProvider is not mounted; fallback to console.error
    }
    const byRespRef = useRef(byResponse);
    useEffect(() => {
        byRespRef.current = byResponse;
    }, [byResponse]);

    const authCtx = useContext(AuthContext);
    const frontendLogoutRef = useRef<() => void>(() => {
    });
    useEffect(() => {
        frontendLogoutRef.current = authCtx?.frontendLogout ?? (() => {
        });
    }, [authCtx]);

    const axiosRef = useRef<AxiosInstance | null>(null);

    if (!axiosRef.current) {
        // Базовый URL относительный (в PROD ходим через тот же домен; в DEV переписывается next.config.ts)
        const inst = axios.create({baseURL: API_BASE_URL});

        /* ---- helpers: log ---- */
        const logReq = (m?: string, u?: string, d?: unknown) =>
            console.info(`API ${m?.toUpperCase()} ➜ ${u}`, fmt(d));

        const logRes = (m?: string, u?: string, s?: number, ms?: number, d?: unknown) =>
            console.info(`API ${m?.toUpperCase()} ⇠ ${u} [${s}] ${ms?.toFixed(0)} ms`, fmt(d));

        inst.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
            const token = getAccess();
            if (token) {
                (cfg.headers as any).Authorization = 'Bearer ' + token;
            }
            const lang = typeof localStorage !== 'undefined' ?
                localStorage.getItem('lang') || 'ru' : getCookie('lang') || 'ru';
            (cfg.headers as any)['Accept-Language'] = lang;
            const csrfToken = getCookie('csrftoken');
            if (csrfToken) {
                (cfg.headers as any)['X-CSRFToken'] = csrfToken;
            }
            if (cfg.url && cfg.url.startsWith('/')) {
                const [path, query] = cfg.url.split('?');
                if (!path.endsWith('/')) {
                    cfg.url = path + '/' + (query ? '?' + query : '');
                }
            }
            (cfg as any)._ts = performance.now();
            logReq(cfg.method, cfg.url, cfg.data);
            return cfg;
        });

        let refreshPromise: Promise<void> | null = null;

        inst.interceptors.response.use(
            (resp) => {
                const {method, url} = resp.config;
                const t0 = (resp.config as any)._ts;
                logRes(method, url, resp.status, t0 ? performance.now() - t0 : undefined, resp.data);
                return resp;
            },
            async (error) => {
                const {method, url} = error.config || {};
                const t0 = (error.config as any)?._ts;
                logRes(method, url, error?.response?.status, t0 ? performance.now() - t0 : undefined, error?.response?.data);

                const original = error.config as AxiosRequestConfig & { _retry?: boolean };
                if (error?.response?.status !== 401 || original?._retry) {
                    return Promise.reject(error);
                }
                original._retry = true;

                if (!refreshPromise) {
                    const refresh = getRefresh();
                    if (!refresh) {
                        frontendLogoutRef.current();
                        return Promise.reject(error);
                    }

                    refreshPromise = inst
                        .post('/api/v1/token/refresh/', {refresh})
                        .then((r: AxiosResponse<{ access: string; refresh?: string }>) =>
                            saveTokens(r.data.access, r.data.refresh ?? refresh))
                        .catch((e) => {
                            clearTokens();
                            frontendLogoutRef.current();
                            throw e;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                }
                await refreshPromise;

                const token = getAccess();
                if (token && original.headers)
                    (original.headers as any).Authorization = 'Bearer ' + token;
                return inst(original);
            },
        );

        axiosRef.current = inst;
    }

    const runner = <T = any>(p: Promise<AxiosResponse<any>>, silent = false): Promise<T> =>
        p.then(r => r.data as T).catch(err => {
            if (!silent) byRespRef.current(err);
            throw err;
        });

    const apiRef = useRef({
        get: <T = any>(u: string, c?: AxiosConfig) => runner<T>(axiosRef.current!.get(u, c)),
        post: <T = any, D = any>(u: string, d?: D, c?: AxiosConfig, s = false) =>
            runner<T>(axiosRef.current!.post(u, d, c), s),
        put: <T = any, D = any>(u: string, d?: D, c?: AxiosConfig, s = false) =>
            runner<T>(axiosRef.current!.put(u, d, c), s),
        patch: <T = any, D = any>(u: string, d?: D, c?: AxiosConfig, s = false) =>
            runner<T>(axiosRef.current!.patch(u, d, c), s),
        delete: <T = any>(u: string, c?: AxiosConfig) =>
            runner<T>(axiosRef.current!.delete(u, c)),
    });

    return {api: apiRef.current};
};
