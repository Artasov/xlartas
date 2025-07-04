import React, {useState} from 'react';
import {Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import RenameDialog from './RenameDialog';
import useLongPress from './useLongPress';
import FolderActions from './FolderActions';

interface Props {
    id: number;
    name: string;
    onDelete?: (id: number) => void;
    onRenamed?: () => void;
}

const FolderCard: React.FC<Props> = ({id, name, onDelete, onRenamed}) => {
    const navigate = useNavigate();
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
            <Paper
                sx={{p: 1, width: 150, cursor: 'pointer'}}
                onDoubleClick={open}
                onContextMenu={e => {e.preventDefault(); setAnchorEl(e.currentTarget);}}
                {...longPress}
            >
                <strong style={{wordBreak: 'break-all'}}>{name}</strong>
            </Paper>
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

export default FolderCard;
