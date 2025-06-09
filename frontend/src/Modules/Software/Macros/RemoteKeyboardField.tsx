// src/Modules/Software/Macros/RemoteKeyboardField.tsx
import React, {useEffect, useRef, useState} from 'react';
import {buildWSUrl} from 'Utils/ws';
import {useTheme} from 'Theme/ThemeContext';
import {FCCC} from 'wide-containers';
import TextField from '@mui/material/TextField';

const WS_URL = buildWSUrl('/ws/macro-control/');   // тот же канал, что и для тачпада

/**
 * Однострочное поле: каждый введённый символ / спец-клавиша
 * отправляется через WebSocket и тут же убирается из поля.
 */
const RemoteKeyboardField: React.FC = () => {
    const {plt} = useTheme();
    const wsRef = useRef<WebSocket | null>(null);
    const [value, set] = useState('');        // всегда держим строку пустой

    /* ---------- создаём сокет один раз ---------- */
    useEffect(() => {
        wsRef.current = new WebSocket(WS_URL);
        return () => wsRef.current?.close();
    }, []);

    /* ---------- отправка клавиши ---------- */
    const sendKey = (key: string) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(JSON.stringify({type: 'key_press', key}));
    };

    /* ---------- printable symbols (onChange) ---------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        if (!text) return;
        // отправляем каждый символ отдельно
        [...text].forEach(ch => sendKey(ch));
        set('');                       // очищаем поле
    };

    /* ---------- special keys (onKeyDown) ---------- */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();

        const key = e.key;             // 'a', 'Enter', 'Backspace', ' '
        if (key.length === 1) return;  // printable → обработаем в onChange

        e.preventDefault();            // блокируем дефолт-ввод
        sendKey(key === ' ' ? 'Space' : key);
        set('');
    };

    return (
        <FCCC w={'100%'} maxW={450} rounded={3} p={2} g={1}
              bg={plt.text.primary + '22'}>
            <TextField
                fullWidth
                variant="filled"
                placeholder="Кликните и печатайте…"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputProps={{style: {textAlign: 'center', paddingTop: '10px'}}}
            />
            <span style={{
                color: plt.text.primary,
                fontSize: '.85rem',
                textAlign: 'center'
            }}>
                Каждый символ сразу отправляется на&nbsp;ПК и&nbsp;не&nbsp;остаётся в&nbsp;поле.
            </span>
        </FCCC>
    );
};

export default RemoteKeyboardField;
