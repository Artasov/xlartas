// src/Modules/Software/Macros/RemoteKeyboardField.tsx
import React, {useEffect, useRef, useState} from 'react';
import {buildWSUrl} from 'Utils/ws';
import {useTheme} from 'Theme/ThemeContext';
import {FCCC} from 'wide-containers';
import TextField from '@mui/material/TextField';

const WS_URL = buildWSUrl('/ws/macro-control/');   // тот же канал, что и для тачпада

/**
 * Поле-однострочник: каждый нажатый символ/клавиша отправляется
 * через WebSocket и мгновенно удаляется из TextField.
 */
const RemoteKeyboardField: React.FC = () => {
    const {plt} = useTheme();
    const wsRef = useRef<WebSocket | null>(null);
    const [value, set] = useState('');            // «мнимое» значение поля

    /* ---------- создаём сокет один раз ---------- */
    useEffect(() => {
        wsRef.current = new WebSocket(WS_URL);
        return () => wsRef.current?.close();
    }, []);

    /* ---------- отправка клавиши ---------- */
    const sendKey = (key: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({type: 'key_press', key}));
    };

    /* ---------- обработчик ↓ ---------- */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();      // чтобы не «улетал» фокус и т.д.
        sendKey(e.key);           // «а», «Д», «Enter», «Backspace» …

        e.preventDefault();       // блокируем дефолт-ввод
        set('');                  // очищаем поле (визуально)
    };

    /* onChange нужен, чтобы TextField не ругался на read-only */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        set(e.target.value);
    };

    return (
        <FCCC w={'100%'} maxW={450} rounded={3} p={2} g={1}
              bg={plt.bg.contrast10}>
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
                color: plt.text.primary30,
                fontSize: '.85rem',
                textAlign: 'center'
            }}>
                Каждый символ отправляется сразу&nbsp;же и&nbsp;не&nbsp;сохраняется&nbsp;в&nbsp;поле.
            </span>
        </FCCC>
    );
};

export default RemoteKeyboardField;
