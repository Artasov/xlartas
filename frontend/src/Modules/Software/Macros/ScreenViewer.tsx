// frontend/src/Modules/Software/Macros/ScreenViewer.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useScreen} from './ScreenViewerProvider';
import {useMacroControl} from './MacroControlProvider';
import FloatingToolbar from './FloatingToolbar';
import FloatingKeyboard from './FloatingKeyboard';
import {FCCC, FRCC} from 'wide-containers';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {useTheme} from 'Theme/ThemeContext';
import MonitorIcon from '@mui/icons-material/Monitor';

interface Props {
    className?: string;
    style?: React.CSSProperties;
}

/** спустя сколько мс считаем, что стрима нет */
const TIMEOUT_MS = 3000 as const;

type StreamState = 'pending' | 'active' | 'off';

const ScreenViewer: React.FC<Props> = ({className, style}) => {
    const {frame, readyState} = useScreen();
    const {sendMouseMove, sendMouseClick, sendMouseScroll} = useMacroControl();
    const {plt} = useTheme();

    const [state, setState] = useState<StreamState>('pending');
    const timerRef = useRef<NodeJS.Timeout>();

    /* ——— определяем state: active ↔ off ——— */
    useEffect(() => {
        if (frame) {
            clearTimeout(timerRef.current);
            setState('active');
            return;
        }

        /* пока ws открывается — ждём TIMEOUT_MS */
        if (state === 'pending' && readyState === WebSocket.OPEN) {
            timerRef.current = setTimeout(() => setState('off'), TIMEOUT_MS);
        }

        /* если сокет закрылся, а кадра так и нет → off */
        if ((readyState === WebSocket.CLOSED ||
                readyState === WebSocket.CLOSING) &&
            !frame) {
            clearTimeout(timerRef.current);
            setState('off');
        }
        return () => clearTimeout(timerRef.current);
    }, [frame, readyState, state]);

    /* ---------- плавающая UI ---------- */
    const [full, setFull] = useState(false);
    const [keyboard, setKbd] = useState(false);
    useEffect(() => {
        if (!full) return;
        const esc = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [full]);

    /* ---------- обработка указателя ---------- */
    const last = useRef<{ x: number; y: number } | null>(null);
    const moveHandler = (e: React.PointerEvent) => {
        if (!last.current) {
            last.current = {x: e.clientX, y: e.clientY};
            return;
        }
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        if (dx || dy) sendMouseMove(dx, dy);
        last.current = {x: e.clientX, y: e.clientY};
    };
    const resetLast = () => (last.current = null);

    const isTouch = matchMedia('(pointer: coarse)').matches;
    const touchTimer = useRef<NodeJS.Timeout | null>(null);

    const pointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') {
            const btn = e.button === 2 ? 'right'
                : e.button === 1 ? 'middle'
                    : 'left';
            sendMouseClick(btn);
            return;
        }
        /* touch: долгое — RMB */
        if (isTouch) {
            touchTimer.current = setTimeout(() => {
                sendMouseClick('right');
                touchTimer.current = null;
            }, 500);
        }
    };
    const pointerUp = () => {
        if (isTouch && touchTimer.current) {
            clearTimeout(touchTimer.current);
            sendMouseClick('left');
            touchTimer.current = null;
        }
    };
    const wheelHandler = (e: React.WheelEvent) => {
        e.preventDefault();
        sendMouseScroll(e.deltaY);
    };

    /* ---------- (A) стрим off ---------- */
    if (state === 'off')
        return (
            <FRCC
                cls={className}
                style={{
                    ...style,
                    color: plt.text.primary + '66',
                    minHeight: 140,
                    userSelect: 'none',
                }}
                g={1}
            >
                <MonitorIcon sx={{fontSize: 46}}/>
                <span style={{fontSize: '1rem'}}>Screen sharing is off</span>
            </FRCC>
        );

    /* ---------- (B) pending: короткий прелоудер ---------- */
    if (state === 'pending')
        return (
            <FCCC cls={className} style={style}>
                <CircularProgress size="90px"/>
            </FCCC>
        );

    /* ---------- (C) active: полноценный viewer ---------- */
    return (
        <>
            {keyboard && <FloatingKeyboard onClose={() => setKbd(false)}/>}

            <div
                className={className}
                style={{
                    position: full ? 'fixed' : 'relative',
                    inset: full ? 0 : undefined,
                    maxWidth: '100%',
                    ...style,
                    background: plt.background.paper,
                    zIndex: full ? 1400 : undefined,
                }}
                onPointerMove={moveHandler}
                onPointerLeave={resetLast}
                onPointerUp={pointerUp}
                onWheel={wheelHandler}
                onPointerDown={pointerDown}
                onPointerCancel={resetLast}
            >
                <img
                    src={`data:image/jpeg;base64,${frame}`}
                    alt="live-screen"
                    style={{width: '100%', display: 'block', userSelect: 'none'}}
                    draggable={false}
                    onContextMenu={e => e.preventDefault()}
                />

                <FloatingToolbar
                    onToggleFull={() => setFull(f => !f)}
                    isFull={full}
                    onToggleKeyboard={() => setKbd(k => !k)}
                />
            </div>
        </>
    );
};

export default ScreenViewer;
