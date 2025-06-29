// Modules/Software/Macros/ScreenViewerProvider.tsx
import React, {createContext, PropsWithChildren, useContext, useEffect, useRef, useState,} from 'react';
import {buildWSUrl} from 'Utils/ws';

const WS_URL = buildWSUrl('/ws/screen-stream/');

interface Ctx {
    /** base64-jpeg без data-uri префикса */
    frame: string | null;
    /** состояние сокета */
    readyState: number;
}

const ScreenCtx = createContext<Ctx | null>(null);

export const ScreenViewerProvider: React.FC<PropsWithChildren> = ({children}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [frame, setFrame] = useState<string | null>(null);
    const [readyState, setState] = useState<number>(WebSocket.CONNECTING);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setState(WebSocket.OPEN);
        ws.onclose = () => setState(WebSocket.CLOSED);
        ws.onerror = () => setState(WebSocket.CLOSING);

        ws.onmessage = (e) => {
            try {
                const obj = JSON.parse(e.data);
                if (obj.type === 'screen.frame') setFrame(obj.data);
            } catch { /* ignore */
            }
        };

        return () => ws.close();
    }, []);

    return (
        <ScreenCtx.Provider value={{frame, readyState}}>
            {children}
        </ScreenCtx.Provider>
    );
};

export const useScreen = () => {
    const ctx = useContext(ScreenCtx);
    if (!ctx) throw new Error('useScreen must be inside ScreenViewerProvider');
    return ctx;
};
