import React, {useRef, useState} from 'react';
import {useTheme} from 'Theme/ThemeContext';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {FCCC, FRSC} from 'wide-containers';
import RemoteKeyboardField from './RemoteKeyboardField';

interface Props {
    onClose: () => void;
}

const FloatingKeyboard: React.FC<Props> = ({onClose}) => {
    const {plt} = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ x: number; y: number }>({x: 40, y: 40});
    const dragData = useRef<{ ox: number; oy: number } | null>(null);

    const startDrag = (e: React.PointerEvent) => {
        dragData.current = {ox: e.clientX - pos.x, oy: e.clientY - pos.y};
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const moveDrag = (e: React.PointerEvent) => {
        if (!dragData.current) return;
        setPos({x: e.clientX - dragData.current.ox, y: e.clientY - dragData.current.oy});
    };
    const endDrag = () => (dragData.current = null);

    return (
        <FCCC
            ref={ref}
            style={{left: pos.x, top: pos.y}}
            pos="fixed"
            zIndex={1600}
            bg={plt.background.paper}
            boxShadow={`0 4px 12px ${plt.text.primary}33`}
            rounded={3}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <FRSC w="100%" g={1} px={1} py={.3} bg={plt.text.primary + '11'}>
                <DragIndicatorIcon sx={{cursor: 'grab'}}/>
                <span style={{flex: 1, textAlign: 'center'}}>Keyboard</span>
                <CloseIcon sx={{cursor: 'pointer'}} onClick={onClose}/>
            </FRSC>
            <RemoteKeyboardField/>
        </FCCC>
    );
};

export default FloatingKeyboard;
