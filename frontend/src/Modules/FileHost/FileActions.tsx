// Modules/FileHost/FileActions.tsx
import React from 'react';
import {IconButton, Menu, MenuItem, Tooltip} from '@mui/material';
import {FRSE} from 'wide-containers';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {IFile} from './types';
import {useTranslation} from 'react-i18next';

interface Props {
    anchorEl?: HTMLElement | null;
    file: IFile;
    variant?: 'menu' | 'buttons';
    selectMode?: boolean;
    selected?: boolean;
    onClose?: () => void;
    onToggleSelect?: (f: IFile) => void;
    onToggleFavorite?: (f: IFile) => void;
    onDelete?: (f: IFile) => void;
    onDownload?: (f: IFile) => void;
    onShare?: (f: IFile) => void;
    onSelectMode?: (f: IFile) => void;
}

const FileActions: React.FC<Props> = ({
                                          anchorEl,
                                          file,
                                          variant = 'menu',
                                          selectMode,
                                          selected,
                                          onClose,
                                          onToggleSelect,
                                          onToggleFavorite,
                                          onDelete,
                                          onDownload,
                                          onShare,
                                          onSelectMode
                                      }) => {
    const {t} = useTranslation();

    const handleDownload = () => {
        onDownload && onDownload(file);
        onClose && onClose();
    };
    const handleShare = () => {
        onShare && onShare(file);
        onClose && onClose();
    };
    const handleDelete = () => {
        onDelete && onDelete(file);
        onClose && onClose();
    };
    const handleSelectMode = () => {
        onSelectMode && onSelectMode(file);
        onClose && onClose();
    };
    const handleToggleSelect = () => {
        onToggleSelect && onToggleSelect(file);
        onClose && onClose();
    };
    const handleFavorite = () => {
        onToggleFavorite && onToggleFavorite(file);
        onClose && onClose();
    };

    if (variant === 'buttons') {
        return (
            <FRSE g={0.5}>
                <Tooltip title={t('download')}><IconButton size="small"
                                                           onClick={handleDownload}><DownloadIcon/></IconButton></Tooltip>
                <Tooltip title={t('share')}><IconButton size="small"
                                                        onClick={handleShare}><ShareIcon/></IconButton></Tooltip>
                {onToggleFavorite && (
                    <Tooltip title={file.is_favorite ? 'Unfavorite' : 'Favorite'}>
                        <IconButton size="small" onClick={handleFavorite}>
                            {file.is_favorite ? <StarIcon/> : <StarBorderIcon/>}
                        </IconButton>
                    </Tooltip>
                )}
                {onDelete && (
                    <Tooltip title={t('delete')}><IconButton size="small"
                                                             onClick={handleDelete}><DeleteIcon/></IconButton></Tooltip>
                )}
            </FRSE>
        );
    }

    return (
        <Menu
            sx={{'& .MuiPaper-root': {backdropFilter: 'blur(10px)'}}}
            slotProps={{backdrop: {sx: {backdropFilter: 'none !important'}}}} anchorEl={anchorEl}
            open={Boolean(anchorEl)} onClose={onClose}>
            <MenuItem onClick={handleDownload}>{t('download')}</MenuItem>
            <MenuItem onClick={handleShare}>{t('share')}</MenuItem>
            {selectMode ? (
                <MenuItem onClick={handleToggleSelect}>{t('select')}</MenuItem>
            ) : (
                <MenuItem onClick={handleSelectMode}>{t('select')}</MenuItem>
            )}
            {onToggleFavorite &&
                <MenuItem onClick={handleFavorite}>{file.is_favorite ? 'Unfavorite' : 'Favorite'}</MenuItem>}
            {onDelete && <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>}
        </Menu>
    );
};

export default FileActions;
