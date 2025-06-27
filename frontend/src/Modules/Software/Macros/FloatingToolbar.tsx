import React, {useRef, useState} from 'react';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import {useTheme} from 'Theme/ThemeContext';
import {FCCC, FR} from 'wide-containers';

interface Props {
    onToggleFull: () => void;
    isFull: boolean;
    onToggleKeyboard: () => void;
}

const FloatingToolbar: React.FC<Props> = ({onToggleFull, isFull, onToggleKeyboard}) => {
    const {plt} = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ x: number; y: number }>({x: 15, y: 15});
    const drag = useRef<{ ox: number; oy: number } | null>(null);

    const start = (e: React.PointerEvent) => {
        drag.current = {ox: e.clientX - pos.x, oy: e.clientY - pos.y};
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const move = (e: React.PointerEvent) => {
        if (!drag.current) return;
        setPos({x: e.clientX - drag.current.ox, y: e.clientY - drag.current.oy});
    };
    const stop = () => (drag.current = null);

    return (
        <div
            ref={ref}
            style={{left: pos.x, top: pos.y}}
            className="position-absolute"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={stop}
            onPointerCancel={stop}
        >
            <button
                style={{
                    borderRadius: '50%',
                    border: 'none',
                    width: 42,
                    height: 42,
                    background: plt.primary.main,
                    color: '#fff',
                    cursor: 'pointer',
                }}
                onClick={() => setOpen(o => !o)}
            >
                <AddIcon/>
            </button>

            {open && (
                <FCCC
                    pos="absolute"
                    top={45}
                    left={0}
                    g={.3}
                    p={.5}
                    bg={plt.background.paper}
                    boxShadow={`0 0 6px ${plt.text.primary}22`}
                    rounded={2}
                    zIndex={1500}
                >
                    <FR g={.5}>
                        <button className="btn btn-icon" onClick={onToggleFull}>
                            {isFull ? <FullscreenExitIcon/> : <FullscreenIcon/>}
                        </button>
                        <button className="btn btn-icon" onClick={onToggleKeyboard}>
                            <KeyboardIcon/>
                        </button>
                    </FR>
                </FCCC>
            )}
        </div>
    );
};

export default FloatingToolbar;
