// Modules/FileHost/FolderActions.tsx
import React from 'react';
import {IconButton, Menu, MenuItem, Tooltip} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import {FRSE} from 'wide-containers';
import {useTranslation} from 'react-i18next';

interface Props {
    anchorEl?: HTMLElement | null;
    variant?: 'menu' | 'buttons';
    onClose?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
}

const FolderActions: React.FC<Props> = ({anchorEl, variant = 'menu', onClose, onRename, onDelete}) => {
    const {t} = useTranslation();

    const handleRename = () => {
        onRename && onRename();
        onClose && onClose();
    };
    const handleDelete = () => {
        onDelete && onDelete();
        onClose && onClose();
    };

    if (variant === 'buttons') {
        return (
            <FRSE g={0.5}>
                <Tooltip title={t('rename')}><IconButton size="small"
                                                         onClick={handleRename}><DriveFileRenameOutlineIcon/></IconButton></Tooltip>
                <Tooltip title={t('delete')}><IconButton size="small" onClick={handleDelete}><DeleteIcon/></IconButton></Tooltip>
            </FRSE>
        );
    }

    return (
        <Menu
            sx={{'& .MuiPaper-root': {backdropFilter: 'blur(10px)'}}}
            slotProps={{backdrop: {sx: {backdropFilter: 'none !important'}}}}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
        >
            <MenuItem onClick={handleRename}>{t('rename')}</MenuItem>
            <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
        </Menu>
    );
};

export default FolderActions;
