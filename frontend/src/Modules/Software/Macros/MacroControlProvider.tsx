// Modules/Software/Macros/MacroControlProvider.tsx
import React, {createContext, PropsWithChildren, useContext, useEffect, useRef, useState} from 'react';
import {buildWSUrl} from 'Utils/ws';

const WS_URL = buildWSUrl('/ws/macro-control/');

interface Ctx {
    readyState: number;
    sendMouseMove: (dx: number, dy: number) => void;
    sendMouseClick: (btn: 'left' | 'middle' | 'right') => void;
    sendMouseScroll: (dy: number) => void;
    sendKeyPress: (key: string) => void;
    sendMacro: (macro: string) => void;
}

const MacroControlContext = createContext<Ctx | null>(null);

export const MacroControlProvider: React.FC<PropsWithChildren> = ({children}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onopen = () => setReadyState(WebSocket.OPEN);
        ws.onclose = () => setReadyState(WebSocket.CLOSED);
        ws.onerror = () => setReadyState(WebSocket.CLOSING);
        return () => ws.close();
    }, []);

    /* ——— тонкая отправка: если сокет ещё открывается, ставим one-shot listener ——— */
    const post = (payload: unknown) => {
        const msg = JSON.stringify(payload);
        const ws = wsRef.current;
        if (!ws) return;
        if (ws.readyState === WebSocket.OPEN) ws.send(msg);
        else if (ws.readyState === WebSocket.CONNECTING)
            ws.addEventListener('open', () => ws.send(msg), {once: true});
    };

    const value: Ctx = {
        readyState,
        sendMouseMove: (dx, dy) => post({type: 'mouse_move', dx, dy}),
        sendMouseClick: btn => post({type: 'mouse_click', button: btn}),
        sendMouseScroll: dy => post({type: 'mouse_scroll', dy}),
        sendKeyPress: key => post({type: 'key_press', key}),
        sendMacro: macro => post({macro}),
    };

    return (
        <MacroControlContext.Provider value={value}>
            {children}
        </MacroControlContext.Provider>
    );
};

export const useMacroControl = () => {
    const ctx = useContext(MacroControlContext);
    if (!ctx) throw new Error('useMacroControl must be used inside MacroControlProvider');
    return ctx;
};
