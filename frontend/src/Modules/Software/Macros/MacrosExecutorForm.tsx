import React, {useContext, useEffect, useRef, useState} from 'react';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {Message} from 'Core/components/Message';
import Button from 'Core/components/elements/Button/Button';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC, FR} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import TextField from '@mui/material/TextField';
import {buildWSUrl} from "Utils/ws";

export function serializeWsEvent(ev: Event): string {
    /* ───────── CloseEvent ───────── */
    if (typeof CloseEvent !== 'undefined' && ev instanceof CloseEvent) {
        const {code, reason, wasClean} = ev;
        return `close - code: ${code}, reason: «${reason || 'нет'}», clean: ${wasClean}`;
    }

    /* ───────── ErrorEvent ───────── */
    if (typeof ErrorEvent !== 'undefined' && ev instanceof ErrorEvent) {
        return `error - ${ev.message || ev.type}`;
    }

    /* ───────── что-то другое ─────── */
    /*  Перебираем собственные поля, чтобы не упасть на circular-link. */
    const plain: Record<string, unknown> = {};
    Object.getOwnPropertyNames(ev).forEach(k => { // enumerable не всё, берём ВСЁ
        // @ts-ignore – run-time проверим
        const v = ev[k];
        if (typeof v !== 'object' && typeof v !== 'function')
            plain[k] = v;
    });

    try {
        return JSON.stringify(plain);
    } catch {
        return ev.type || ev.toString();
    }
}

/**
 * Форма-однострочник для отправки имени макроса на сервер.
 *
 * Алгоритм:
 *   1. При нажатии «Выполнить» открывается WebSocket-соединение
 *      к /ws/macro-control/ (без дополнительных query-параметров).
 *   2. После открытия соединения шлем  `{macro: "<имя>"}`  и тут же
 *      закрываем сокет.
 *   3. Показываем toast-уведомление об успехе/ошибке.
 *
 * Авторизация идёт автоматически: Channels получит
 * `scope["user"]` из cookie-сессии (или другого бекенд-механизма),
 * поэтому никаких `uid`, `username` или `secret_key` в URL не нужны.
 *
 * Использование:
 * ```tsx
 * <MacrosExecutorForm onExecuted={m => console.log('macro sent:', m)}/>
 * ```
 */
interface Props {
    onExecuted?: (macroName: string) => void;
    className?: string;
}

const WS_URL = buildWSUrl('/ws/macro-control/');

const MacrosExecutorForm: React.FC<Props> = ({onExecuted, className}) => {
    const {user, isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();

    const [macro, setMacro] = useState('');
    const [loading, setLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    /** Отправка макроса. */
    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!isAuthenticated || !user) {
            Message.error('Необходимо войти в аккаунт');
            return;
        }
        if (!macro.trim()) {
            Message.error('Введите имя макроса');
            return;
        }

        setLoading(true);
        try {
            /* 1. Создаём сокет. */
            wsRef.current = new WebSocket(WS_URL);

            /* 2. При открытии — отсылаем макрос и закрываемся. */
            wsRef.current.onopen = () => {
                wsRef.current?.send(
                    JSON.stringify({macro: macro.trim()})
                );
                wsRef.current?.close();

                Message.success(`Команда «${macro.trim()}» отправлена`);
                if (onExecuted) onExecuted(macro.trim());
                setMacro('');
            };

            /* Ошибки соединения. */
            wsRef.current.onerror = ev => {
                console.error('WebSocket error:', ev);
                Message.error(`WebSocket error: ${serializeWsEvent(ev)}`);
                Message.error('Не удалось установить WebSocket-соединение');
                setLoading(false);
            };

            /* Гарантируем, что индикатор спрячется, даже если onopen не вызовется. */
            wsRef.current.onclose = () => setLoading(false);
        } catch (err) {
            console.error(err);
            Message.error('Произошла ошибка при отправке команды');
            setLoading(false);
        }
    };

    /* Закрываем сокет, если компонент размонтируется. */
    useEffect(() => () => wsRef.current?.close(), []);

    return (
        <form onSubmit={handleSubmit} className={className}>
            <FC g={1} maxW={400}>
                <TextField
                    label="Имя макроса"
                    value={macro}
                    onChange={e => setMacro(e.target.value)}
                    fullWidth
                    variant="filled"
                    sx={{height: 60}}
                />
                <FR g={1}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        style={{minWidth: 120}}
                    >
                        {loading
                            ? <CircularProgress size="1.6rem"/>
                            : 'Выполнить'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setMacro('')}
                        disabled={loading || !macro}
                    >
                        Сброс
                    </Button>
                </FR>
            </FC>
        </form>
    );
};

export default MacrosExecutorForm;
