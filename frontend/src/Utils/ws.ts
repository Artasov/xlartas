// Utils/ws.ts
/**
 * Собрать WebSocket-URL c учётом:
 *   • в PROD — подключаемся к текущему домену и пути (через Nginx Proxy Manager);
 *   • в DEV (next dev на :3000) — коннектимся к :8000;
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

    // DEV: next dev (3000) -> backend (8000)
    const devHost = host.includes(':3000') ? host.replace(':3000', ':8000') : host;

    return `${proto}://${devHost}${path.startsWith('/') ? path : `/${path}`}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};
