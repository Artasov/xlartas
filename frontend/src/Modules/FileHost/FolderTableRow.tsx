import React, {useState} from 'react';
import {IconButton, Menu, MenuItem, TableCell, TableRow} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import RenameDialog from './RenameDialog';
import {useApi} from '../Api/useApi';

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
            >
                <TableCell component="th" scope="row">
                    {name}
                </TableCell>
                <TableCell align="right">
                    <IconButton
                        size="small"
                        onClick={e => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                        }}
                    >
                        <MoreVertIcon fontSize="small"/>
                    </IconButton>
                </TableCell>
            </TableRow>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
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
