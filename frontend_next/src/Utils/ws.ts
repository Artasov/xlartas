// Utils/ws.ts
/**
 * Собрать WebSocket-URL c учётом:
 *   • REACT_APP_WS_URL – если задан, используем его (dev-proxy, Docker и т.п.);
 *   • текущий протокол страницы (ws:// ↔ wss://);
 *   • localhost → порт 8000 (backend runserver);
 *
 * @param path «хвост» (/ws/…/) – со слешом в начале или без разницы.
 */
export const buildWSUrl = (path: string): string => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;             // keeps :<port> if any
    const token = localStorage.getItem('access');   // simple-jwt access
    return `${proto}://${host}${path}${token ? `?token=${token}` : ''}`.replace(':3000', ':8000');
};