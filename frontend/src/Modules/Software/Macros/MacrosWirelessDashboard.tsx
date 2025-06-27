// src/Modules/Software/Macros/MacrosWirelessDashboard.tsx
import React, {useEffect, useState} from 'react';
import {
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    // TODO: export default const ListItemSecondaryAction: ((props: ListItemSecondaryActionProps) => React.JSX.Element) & {     muiName: string }
    // Must be used as the last child of ListItem to function properly.
    // Demos:
    // Lists
    // API:
    // ListItemSecondaryAction API
    // Deprecated:
    // Use the secondaryAction prop in the ListItem component instead. This component will be removed in a future major release. See Migrating from deprecated APIs  for more details.
    ListItemText,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/AddRounded';
import {Message} from 'Core/components/Message';
import {FC, FRC, FREC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import MacroFormDialog from './MacroFormDialog';
import {useApi} from '../../Api/useApi';
import {WirelessMacro} from '../Types/Software';
import {useMacroControl} from './MacroControlProvider';

const MacrosWirelessDashboard: React.FC = () => {
    const {plt} = useTheme();
    const {api} = useApi();
    const {sendMacro} = useMacroControl();

    const [macros, setMacros] = useState<WirelessMacro[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WirelessMacro>();

    const load = async () => {
        try {
            setMacros((await api.get('/api/v1/wireless-macros/')).results);
        } catch {
            Message.error('Не удалось загрузить список макросов');
        }
    };
    useEffect(() => {
        load().then();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/api/v1/wireless-macros/${id}/`);
            setMacros(prev => prev!.filter(m => m.id !== id));
        } catch {
            Message.error('Не удалось удалить макрос');
        }
    };

    const upsert = (m: WirelessMacro) =>
        setMacros(prev => [...prev!.filter(o => o.id !== m.id), m]
            .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)));

    if (macros === null) return <FRC mt={3}><CircularProgress/></FRC>;

    return (
        <FC>
            <FREC pos={'absolute'} bottom={'1rem'} right={'1rem'} component="h2" color={plt.text.primary} g={.8}
                  fontSize="1rem">
                <IconButton
                    sx={{width: 42, height: 42, background: plt.primary.main + '11'}}
                    onClick={() => {
                        setEditing(undefined);
                        setFormOpen(true);
                    }}>
                    <AddIcon fontSize="large"/>
                </IconButton>
            </FREC>

            {macros.length === 0 && (
                <p style={{color: plt.text.primary}}>Пока ничего не сохранено. Нажмите «+», чтобы добавить.</p>
            )}

            <List dense sx={{width: '100%'}}>
                {macros.map(m => (
                    <ListItem key={m.id} divider onClick={() => sendMacro(m.name)}>
                        <ListItemText sx={{opacity: '80%'}} primary={m.name}/>
                        <ListItemSecondaryAction sx={{opacity: '60%'}}>
                            {/* TODO: export default const ListItemSecondaryAction: ((props: ListItemSecondaryActionProps) => React.JSX.Element) & {     muiName: string }
Must be used as the last child of ListItem to function properly.
Demos:
Lists
API:
ListItemSecondaryAction API
Deprecated:
Use the secondaryAction prop in the ListItem component instead. This component will be removed in a future major release. See Migrating from deprecated APIs  for more details.*/}
                            <Tooltip title="Редактировать">
                                <IconButton size="small" onClick={e => {
                                    e.stopPropagation();
                                    setEditing(m);
                                    setFormOpen(true);
                                }}>
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                                <IconButton size="small" onClick={e => {
                                    e.stopPropagation();
                                    handleDelete(m.id).then();
                                }}>
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

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
