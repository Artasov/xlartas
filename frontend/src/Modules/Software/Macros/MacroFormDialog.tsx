import React, {useEffect, useState} from 'react';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {Message} from 'Core/components/Message';
import {useApi} from "../../Api/useApi";
import {WirelessMacro} from "../Types/Software";

interface Props {
    /** Открыто ли окно */
    open: boolean;
    /** Закрыть без сохранения */
    onClose: () => void;
    /** Сохранено (вернём обновлённый/новый объект) */
    onSaved: (m: WirelessMacro) => void;
    /** Если передан – режим редактирования */
    macro?: WirelessMacro;
}

const MacroFormDialog: React.FC<Props> = ({open, onClose, onSaved, macro}) => {
    const isEdit = Boolean(macro);
    const [name, setName] = useState(macro?.name ?? '');
    const [priority, setPriority] = useState(macro?.priority ?? 0);
    const [saving, setSaving] = useState(false);
    const {api} = useApi();

    /* Подтягиваем данные при повторных открытиях диалога */
    useEffect(() => {
        if (macro) {
            setName(macro.name);
            setPriority(macro.priority);
        } else {
            setName('');
            setPriority(0);
        }
    }, [macro, open]);

    const handleSave = async () => {
        if (!name.trim()) {
            Message.error('Имя не может быть пустым');
            return;
        }
        setSaving(true);
        try {
            let resp: WirelessMacro;
            if (isEdit) {
                resp = await api.patch<WirelessMacro>(
                    `/api/v1/wireless-macros/${macro!.id}/`,
                    {name: name.trim(), priority}
                );
            } else {
                resp = await api.post<WirelessMacro>(
                    '/api/v1/wireless-macros/',
                    {name: name.trim(), priority}
                );
            }
            onSaved(resp);
            onClose();
        } catch (e) {
            console.error(e);
            Message.error('Не удалось сохранить макрос');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{isEdit ? 'Редактировать макрос' : 'Новый макрос'}</DialogTitle>

            <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <TextField
                    label="Имя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                    autoFocus
                    sx={{mt: 1}}
                />
                <TextField
                    label="Приоритет (меньше — выше)"
                    type="number"
                    value={priority}
                    onChange={e => setPriority(parseInt(e.target.value, 10) || 0)}
                    fullWidth
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>Отмена</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? <CircularProgress size="1.2rem"/> : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MacroFormDialog;
