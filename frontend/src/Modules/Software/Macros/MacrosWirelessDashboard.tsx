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
import {FC, FR, FRC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import MacroFormDialog from './MacroFormDialog';
import {useApi} from "../../Api/useApi";
import {WirelessMacro} from "../Types/Software";
import {buildWSUrl} from "Utils/ws";

const WS_URL = buildWSUrl('/ws/macro-control/');

const executeMacroWS = (macro: string) => {
    const ws = new WebSocket(buildWSUrl('/ws/macro-control/'));
    ws.onopen = () => {
        ws.send(JSON.stringify({macro}));
        ws.close();
    };
    ws.onerror = () => Message.error('Ошибка WebSocket-соединения');
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

    if (macros === null) return <FRC mt={3}><CircularProgress/></FRC>;

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
