// Modules/Software/Macros/MacrosWirelessDashboard.tsx
import React, {useEffect, useState} from 'react';
import {Box, IconButton, List, ListItem, ListItemText, Tooltip,} from '@mui/material';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/AddRounded';
import {Message} from 'Core/components/Message';
import {FC, FRC, FREC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import MacroFormDialog from './MacroFormDialog';
import {useApi} from 'Api/useApi';
import {WirelessMacro} from '../Types/Software';
import {useMacroControl} from './MacroControlProvider';
import {useTranslation} from 'react-i18next';

const MacrosWirelessDashboard: React.FC = () => {
    const {plt} = useTheme();
    const {api} = useApi();
    const {sendMacro} = useMacroControl();

    const [macros, setMacros] = useState<WirelessMacro[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WirelessMacro>();
    const {t} = useTranslation();

    const load = async () => {
        try {
            setMacros((await api.get('/api/v1/wireless-macros/')).results);
        } catch {
            Message.error(t('load_macros_error'));
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
            Message.error(t('delete_macro_error'));
        }
    };

    const upsert = (m: WirelessMacro) =>
        setMacros(prev => [...prev!.filter(o => o.id !== m.id), m]
            .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)));

    if (macros === null) return <FRC mt={3}><CircularProgressZoomify in/></FRC>;

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
                <p style={{color: plt.text.primary}}>{t('nothing_saved')}</p>
            )}

            <List dense sx={{width: '100%'}}>
                {macros.map(m => (
                    <ListItem
                        key={m.id}
                        divider
                        onClick={() => sendMacro(m.name)}
                        secondaryAction={(
                            <Box sx={{opacity: '60%'}}>
                                <Tooltip title={t('edit')}>
                                    <IconButton size="small" onClick={e => {
                                        e.stopPropagation();
                                        setEditing(m);
                                        setFormOpen(true);
                                    }}>
                                        <EditIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('delete')}>
                                    <IconButton size="small" onClick={e => {
                                        e.stopPropagation();
                                        handleDelete(m.id).then();
                                    }}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    >
                        <ListItemText sx={{opacity: '80%'}} primary={m.name}/>
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
