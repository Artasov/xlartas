import React, {useEffect, useRef, useState} from 'react';
import {buildWSUrl} from 'Utils/ws';
import {useTheme} from 'Theme/ThemeContext';
import {FCCC} from 'wide-containers';
import TextField from '@mui/material/TextField';

const WS_URL = buildWSUrl('/ws/macro-control/');

/**
 * Однострочное поле: каждый введённый символ / спец-клавиша
 * отправляется через WebSocket и тут же убирается из поля.
 */
const RemoteKeyboardField: React.FC = () => {
    const {plt} = useTheme();
    const wsRef = useRef<WebSocket | null>(null);
    const [value, setValue] = useState('');

    /* anti-duplicate */
    const lastSentRef = useRef<{ ch: string; ts: number }>({ch: '', ts: 0});

    /* ---------- создаём сокет один раз ---------- */
    useEffect(() => {
        wsRef.current = new WebSocket(WS_URL);
        return () => wsRef.current?.close();
    }, []);

    /* ---------- отправка клавиши ---------- */
    const sendKey = (key: string) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const now = Date.now();
        if (key === lastSentRef.current.ch && now - lastSentRef.current.ts < 80) return;
        lastSentRef.current = {ch: key, ts: now};

        ws.send(JSON.stringify({type: 'key_press', key}));
    };

    /* ---------- printable symbols (onChange) ---------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        if (!text) return;
        [...text].forEach(ch => sendKey(ch));
        setValue(''); // очищаем поле
    };

    /* ---------- special keys (onKeyDown) ---------- */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const key = e.key;                    // 'a', 'Enter', 'Backspace', …
        if (key.length === 1) return;         // printable → onChange
        e.preventDefault();                   // блокируем дефолт-ввод
        sendKey(key === ' ' ? 'Space' : key);
        setValue('');
    };

    return (
        <FCCC w="100%">
            <TextField
                fullWidth
                variant="filled"
                placeholder="Tap here and type…"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputProps={{
                    style: {textAlign: 'center', paddingTop: '10px'},
                    autoCapitalize: 'none',
                    autoCorrect: 'off',
                    autoComplete: 'off',
                    spellCheck: 'false',
                    inputMode: 'text',
                }}
            />
        </FCCC>
    );
};

export default RemoteKeyboardField;
