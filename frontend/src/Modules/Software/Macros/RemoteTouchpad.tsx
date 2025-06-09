// src/Modules/Software/Macros/RemoteTouchpad.tsx
import React, {useRef} from 'react';
import {useTheme} from 'Theme/ThemeContext';
import {FCCC} from 'wide-containers';
import {useMacroControl} from './MacroControlProvider';

const RemoteTouchpad: React.FC = () => {
    const {plt} = useTheme();
    const {sendMouseMove} = useMacroControl();

    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const frameRequestedRef = useRef(false);
    const moveQueueRef = useRef<{ dx: number; dy: number }>({dx: 0, dy: 0});

    const flush = () => {
        frameRequestedRef.current = false;
        const {dx, dy} = moveQueueRef.current;
        if (dx || dy) sendMouseMove(dx, dy);
        moveQueueRef.current = {dx: 0, dy: 0};
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        lastPosRef.current = {x: e.clientX, y: e.clientY};
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!lastPosRef.current) return;
        const {x: lx, y: ly} = lastPosRef.current;
        moveQueueRef.current.dx += e.clientX - lx;
        moveQueueRef.current.dy += e.clientY - ly;
        lastPosRef.current = {x: e.clientX, y: e.clientY};

        if (!frameRequestedRef.current) {
            frameRequestedRef.current = true;
            requestAnimationFrame(flush);
        }
    };

    return (
        <FCCC w="100%" maxW={450} rounded={3} p={2}
              bg={plt.text.primary + '22'}
              sx={{
                  userSelect: 'none',
                  touchAction: 'none',
                  aspectRatio: '1 / .7',
                  cursor: 'pointer',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => (lastPosRef.current = null)}>
            <span style={{color: plt.text.primary, fontSize: '1rem'}}>
                Remote touchpad
            </span>
            <span style={{
                color: plt.text.primary,
                fontSize: '.9rem',
                textAlign: 'center',
            }}>
                Включите функцию Remote&nbsp;Touchpad в xlmacros чтобы использовать это.
            </span>
        </FCCC>
    );
};

export default RemoteTouchpad;
