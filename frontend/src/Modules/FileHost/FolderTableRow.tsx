import React, {useState} from 'react';
import {TableCell, TableRow} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import RenameDialog from './RenameDialog';
import useLongPress from './useLongPress';
import FolderActions from './FolderActions';

interface Props {
    id: number;
    name: string;
    onDelete?: (id: number) => void;
    onRenamed?: () => void;
    onOpen?: (id: number) => void;
}

const FolderTableRow: React.FC<Props> = ({id, name, onDelete, onRenamed, onOpen}) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showRename, setShowRename] = useState(false);
    const longPress = useLongPress(e => setAnchorEl(e.currentTarget as HTMLElement));

    const open = () => {
        if (onOpen) onOpen(id);
        else navigate(`/storage/master/${id}/`);
    };
    const handleDelete = async () => {
        onDelete && onDelete(id);
        setAnchorEl(null);
    };

    return (
        <>
            <TableRow
                hover
                sx={{cursor: 'pointer'}}
                onClick={open}
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
            <FolderActions
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                onRename={() => setShowRename(true)}
                onDelete={handleDelete}
            />
            <RenameDialog
                open={showRename}
                id={id}
                name={name}
                onClose={() => setShowRename(false)}
                onRenamed={onRenamed}
            />
        </>
    );
};

export default FolderTableRow;
