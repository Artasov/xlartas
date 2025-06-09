import React from 'react';
import {FCCC, FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {useMacroControl} from './MacroControlProvider';

const RemoteMouse: React.FC = () => {
    const {plt} = useTheme();
    const {sendMouseClick, readyState} = useMacroControl();

    const btnCss: React.CSSProperties = {
        flex: 1,
        padding: '.55rem 0',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        cursor: readyState === WebSocket.OPEN ? 'pointer' : 'not-allowed',
        background: plt.text.primary + '22',
        color: plt.text.primary,
        userSelect: 'none',
    };

    const mkClick = (btn: 'left' | 'middle' | 'right') =>
        () => readyState === WebSocket.OPEN && sendMouseClick(btn);

    return (
        <FCCC w="100%" maxW={450}>
            <FRCC g={1} w="100%">
                <button style={btnCss} onClick={mkClick('left')}>LMB</button>
                <button style={btnCss} onClick={mkClick('middle')}>MMB</button>
                <button style={btnCss} onClick={mkClick('right')}>RMB</button>
            </FRCC>
        </FCCC>
    );
};

export default RemoteMouse;
