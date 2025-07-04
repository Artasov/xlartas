import React, {useState} from 'react';
import {Menu, MenuItem, TableCell, TableRow} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import RenameDialog from './RenameDialog';
import {useApi} from '../Api/useApi';
import useLongPress from './useLongPress';

interface Props {
    id: number;
    name: string;
    onDelete?: (id: number) => void;
    onRenamed?: () => void;
}

const FolderTableRow: React.FC<Props> = ({id, name, onDelete, onRenamed}) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {api} = useApi();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showRename, setShowRename] = useState(false);
    const longPress = useLongPress(e => setAnchorEl(e.currentTarget as HTMLElement));

    const open = () => navigate(`/storage/master/${id}/`);
    const handleDelete = async () => {
        onDelete && onDelete(id);
        setAnchorEl(null);
    };

    return (
        <>
            <TableRow
                hover
                sx={{cursor: 'pointer'}}
                onDoubleClick={open}
                onContextMenu={e => {
                    e.preventDefault();
                    setAnchorEl(e.currentTarget);
                }}
                {...longPress}
            >
                <TableCell component="th" scope="row">
                    {name}
                </TableCell>
                <TableCell/>
            </TableRow>
            <Menu
                slotProps={{backdrop:{sx:{backdropFilter:'none !important'}}}}
                anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem
                    onClick={() => {
                        setShowRename(true);
                        setAnchorEl(null);
                    }}
                >
                    {t('rename')}
                </MenuItem>
                <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
            </Menu>
            <RenameDialog open={showRename} id={id} name={name} onClose={() => setShowRename(false)} onRenamed={onRenamed}/>
        </>
    );
};

export default FolderTableRow;
