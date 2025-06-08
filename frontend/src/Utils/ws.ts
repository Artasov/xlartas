// src/Utils/ws.ts
/**
 * Собрать WebSocket-URL c учётом:
 *   • REACT_APP_WS_URL – если задан, используем его (dev-proxy, Docker и т.п.);
 *   • текущий протокол страницы (ws:// ↔ wss://);
 *   • localhost → порт 8000 (backend runserver);
 *
 * @param path «хвост» (/ws/…/) – со слешом в начале или без разницы.
 */
export function buildWSUrl(path: string): string {
    /* 1. .env имеет приоритет — удобно на CI/стендовых. */
    const env = process.env.REACT_APP_WS_URL;
    if (env) {
        return `${env.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }

    /* 2. Собираем из window.location. */
    const isHttps = window.location.protocol === 'https:';
    const proto = isHttps ? 'wss' : 'ws';
    const host = window.location.hostname;
    const port = !isHttps ? ':8000' : '';         // http ⇒ dev-порт, https ⇒ 443

    return `${proto}://${host}${port}/${path.replace(/^\//, '')}`;
}
