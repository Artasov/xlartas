// src/Modules/Software/Macros/MacrosExecutorForm.tsx
import React, {useContext, useState} from 'react';
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {Message} from 'Core/components/Message';
import {Button} from '@mui/material';
import CircularProgress from 'Core/components/elements/CircularProgress';
import TextField from '@mui/material/TextField';
import {FC, FR} from 'wide-containers';
import {useMacroControl} from './MacroControlProvider';

interface Props {
    onExecuted?: (macroName: string) => void;
    className?: string;
}

const MacrosExecutorForm: React.FC<Props> = ({onExecuted, className}) => {
    const {user, isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {sendMacro, readyState} = useMacroControl();

    const [macro, setMacro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isAuthenticated || !user) {
            Message.error('Необходимо войти в аккаунт');
            return;
        }
        const name = macro.trim();
        if (!name) {
            Message.error('Введите имя макроса');
            return;
        }

        setLoading(true);
        if (readyState === WebSocket.OPEN) {
            sendMacro(name);
            Message.success(`Команда «${name}» отправлена`);
            onExecuted?.(name);
            setMacro('');
            setLoading(false);
        } else {
            Message.error('WebSocket ещё не установлен — попробуйте через секунду');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <FC g={1.3} maxW={400}>
                <TextField
                    label="Имя макроса"
                    value={macro}
                    onChange={e => setMacro(e.target.value)}
                    fullWidth
                    variant="filled"
                />
                <FR g={1}>
                    <Button type="submit" variant="contained" disabled={loading} sx={{
                        fontSize: '1rem', fontWeight: 600,
                    }}>
                        {loading ? <CircularProgress size="1.6rem"/> : 'Execute'}
                    </Button>
                </FR>
            </FC>
        </form>
    );
};

export default MacrosExecutorForm;
