import React, {useState} from 'react';
import {Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import RenameDialog from './RenameDialog';
import useLongPress from './useLongPress';
import FolderActions from './FolderActions';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import {FC, FCCC, FR} from "wide-containers";
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
interface Props {
    id: number;
    name: string;
    onDelete?: (id: number) => void;
    onRenamed?: () => void;
    onOpen?: (id: number) => void;
}

const FolderCard: React.FC<Props> = ({id, name, onDelete, onRenamed, onOpen}) => {
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
            <Paper
                sx={{p: 1, width: 156, cursor: 'pointer'}}
                onClick={open}
                onContextMenu={e => {
                    e.preventDefault();
                    setAnchorEl(e.currentTarget);
                }}
                {...longPress}
            >
                <FCCC>
                    <FR opacity={80}><FolderRoundedIcon sx={{fontSize: '6rem'}}/></FR>
                    <strong style={{wordBreak: 'break-all'}}>{name}</strong>
                </FCCC>
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
