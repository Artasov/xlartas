// Modules/Software/Macros/MacrosExecutorForm.tsx
import React, {useState} from 'react';
import {useAuth} from 'Auth/AuthContext';
import {Message} from 'Core/components/Message';
import {Button} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import TextField from '@mui/material/TextField';
import {FC, FR} from 'wide-containers';
import {useMacroControl} from './MacroControlProvider';
import {useTranslation} from "react-i18next";

interface Props {
    onExecuted?: (macroName: string) => void;
    className?: string;
}

const MacrosExecutorForm: React.FC<Props> = ({onExecuted, className}) => {
    const {user, isAuthenticated} = useAuth();
    const {sendMacro, readyState} = useMacroControl();

    const [macro, setMacro] = useState('');
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isAuthenticated || !user) {
            Message.error(t('need_login'));
            return;
        }
        const name = macro.trim();
        if (!name) {
            Message.error(t('enter_macro_name'));
            return;
        }

        setLoading(true);
        if (readyState === WebSocket.OPEN) {
            sendMacro(name);
            Message.success(t('command_sent', {name}));
            onExecuted?.(name);
            setMacro('');
            setLoading(false);
        } else {
            Message.error(t('websocket_not_ready'));
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <FC g={1.3} maxW={400}>
                <TextField
                    label={t('macro_name')}
                    value={macro}
                    onChange={e => setMacro(e.target.value)}
                    fullWidth
                    variant="filled"
                />
                <FR g={1}>
                    <Button type="submit" disabled={loading} sx={{
                        fontSize: '1rem', fontWeight: 600,
                    }}>
                        {loading ? <CircularProgressZoomify in size="1.6rem"/> : t('execute')}
                    </Button>
                </FR>
            </FC>
        </form>
    );
};

export default MacrosExecutorForm;
