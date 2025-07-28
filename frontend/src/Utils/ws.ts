// Utils/ws.ts
/**
 * Собрать WebSocket-URL c учётом:
 *   • REACT_APP_WS_URL – если задан, используем его (dev-proxy, Docker и т.п.);
 *   • текущий протокол страницы (ws:// ↔ wss://);
 *   • localhost → порт 8000 (backend runserver);
 *
 * @param path «хвост» (/ws/…/) – со слешом в начале или без разницы.
 */

export function getWsProtocol(): 'ws' | 'wss' {
    if (typeof window === 'undefined') {
        // На сервере не знаем протокол клиента — возвращаем безопасный по умолчанию
        return 'ws';
    }
    return window.location.protocol === 'https:' ? 'wss' : 'ws';
}

export const buildWSUrl = (path: string): string => {
    const host = typeof window !== 'undefined'
        ? window.location.host
        : 'localhost:3000';
    const proto = getWsProtocol();
    const token = typeof window !== 'undefined'
        ? window.localStorage.getItem('access')
        : null;
    return `${proto}://${host}${path}${token ? `?token=${token}` : ''}`.replace(':3000', ':8000');
};
