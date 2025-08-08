// Modules/Software/Macros/MacroFormDialog.tsx
import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {Message} from 'Core/components/Message';
import {useSoftwareApi} from 'Software/useSoftwareApi';
import {WirelessMacro} from "../Types/Software";
import {useTranslation} from "react-i18next";

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
    const {updateWirelessMacro, createWirelessMacro} = useSoftwareApi();
    const {t} = useTranslation();

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
            Message.error(t('macro_name_empty'));
            return;
        }
        setSaving(true);
        try {
            let resp: WirelessMacro;
            if (isEdit) {
                resp = await updateWirelessMacro(macro!.id, {name: name.trim(), priority});
            } else {
                resp = await createWirelessMacro({name: name.trim(), priority});
            }
            onSaved(resp);
            onClose();
        } catch (e) {
            console.error(e);
            Message.error(t('macro_saved_error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{isEdit ? t('edit_macro') : t('new_macro')}</DialogTitle>

            <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <TextField
                    label={t('macro_name')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                    autoFocus
                    sx={{mt: 1}}
                />
                <TextField
                    label={t('priority')}
                    type="number"
                    value={priority}
                    onChange={e => setPriority(parseInt(e.target.value, 10) || 0)}
                    fullWidth
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>{t('cancel')}</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? <CircularProgressZoomify in size="1.2rem"/> : t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MacroFormDialog;
