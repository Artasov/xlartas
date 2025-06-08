import React, {useEffect, useState} from 'react';
import {
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {Message} from 'Core/components/Message';
import {FC, FR} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import MacroFormDialog from './MacroFormDialog';
import {useApi} from "../../Api/useApi";
import {WirelessMacro} from "../Types/Software";
import {DOMAIN} from "../../Api/axiosConfig";

const protocol = window.location.protocol;
const WS_URL = process.env.REACT_APP_WS_URL
    ? `${process.env.REACT_APP_WS_URL.replace(/\/$/, '')}/ws/macro-control/`
    : `ws://${DOMAIN}${protocol === 'http:' ? ':8000' : ''}/ws/macro-control/`;

/** Отправка макроса по WebSocket и короткий toast-результат. */
const executeMacroWS = (macro: string) => {
    try {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            ws.send(JSON.stringify({macro}));
            ws.close();
            Message.success(`Команда «${macro}» отправлена`);
        };
        ws.onerror = () => Message.error('Ошибка WebSocket-соединения');
    } catch (e) {
        console.error(e);
        Message.error('Не удалось отправить команду');
    }
};

const MacrosWirelessDashboard: React.FC = () => {
    const {plt} = useTheme();
    const {api} = useApi();

    const [macros, setMacros] = useState<WirelessMacro[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WirelessMacro | undefined>();

    /** Загрузка списка */
    const load = async () => {
        try {
            setMacros((await api.get('/api/v1/wireless-macros/')).results);
        } catch (e) {
            console.error(e);
            Message.error('Не удалось загрузить список макросов');
        }
    };
    useEffect(() => {
        load();
    }, []);

    /** Удаление */
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/api/v1/wireless-macros/${id}/`);
            setMacros(prev => prev!.filter(m => m.id !== id));
        } catch (e) {
            console.error(e);
            Message.error('Не удалось удалить макрос');
        }
    };

    /** Создание / изменение */
    const upsert = (macro: WirelessMacro) => {
        setMacros(prev => {
            const without = prev!.filter(m => m.id !== macro.id);
            return [...without, macro]
                .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
        });
    };

    if (macros === null) return <CircularProgress/>;

    return (
        <FC mt={4}>
            {/* ------------------- заголовок и «плюс» ------------------- */}
            <FR component="h2" color={plt.text.primary80} gap={1.2} fontSize="1.4rem">
                <span>Панель</span>
                <IconButton
                    sx={{width: 28, height: 28, background: plt.primary.main + '11'}}
                    onClick={() => {
                        setEditing(undefined);
                        setFormOpen(true);
                    }}
                >
                    <AddIcon fontSize="small"/>
                </IconButton>
            </FR>

            {macros.length === 0 && (
                <p style={{color: plt.text.primary50}}>
                    Пока ничего не сохранено. Нажмите «+», чтобы добавить.
                </p>
            )}

            {/* ----------------------- список ----------------------- */}
            <List dense sx={{width: '100%', maxWidth: 500}}>
                {macros.map(m => (
                    <ListItem
                        key={m.id}
                        divider
                        onClick={() => executeMacroWS(m.name)}
                    >
                        <ListItemText
                            primary={m.name}
                            secondary={`Приоритет: ${m.priority}`}
                        />

                        <ListItemSecondaryAction>
                            {/* --- редактировать --- */}
                            <Tooltip title="Редактировать">
                                <IconButton
                                    size="small"
                                    onClick={e => {  /* не пускаем «вверх» */
                                        e.stopPropagation();
                                        setEditing(m);
                                        setFormOpen(true);
                                    }}
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>

                            {/* --- удалить --- */}
                            <Tooltip title="Удалить">
                                <IconButton
                                    size="small"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDelete(m.id);
                                    }}
                                >
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            {/* ---------- модальное окно (create / edit) ---------- */}
            <MacroFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={upsert}
                macro={editing}
            />
        </FC>
    );
};

export default MacrosWirelessDashboard;
