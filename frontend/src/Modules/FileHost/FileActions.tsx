import React from 'react';
import {Menu, MenuItem} from '@mui/material';
import {IFile} from './types';
import {useTranslation} from 'react-i18next';

interface Props {
    anchorEl: HTMLElement | null;
    file: IFile;
    selectMode?: boolean;
    selected?: boolean;
    onClose: () => void;
    onToggleSelect?: (f: IFile) => void;
    onToggleFavorite?: (f: IFile) => void;
    onDelete?: (f: IFile) => void;
    onDownload?: (f: IFile) => void;
    onShare?: (f: IFile) => void;
    onSelectMode?: (f: IFile) => void;
}

const FileActions: React.FC<Props> = ({anchorEl, file, selectMode, selected, onClose, onToggleSelect, onToggleFavorite, onDelete, onDownload, onShare, onSelectMode}) => {
    const {t} = useTranslation();

    const handleDownload = () => { onDownload && onDownload(file); onClose(); };
    const handleShare = () => { onShare && onShare(file); onClose(); };
    const handleDelete = () => { onDelete && onDelete(file); onClose(); };
    const handleSelectMode = () => { onSelectMode && onSelectMode(file); onClose(); };
    const handleToggleSelect = () => { onToggleSelect && onToggleSelect(file); onClose(); };
    const handleFavorite = () => { onToggleFavorite && onToggleFavorite(file); onClose(); };

    return (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
            <MenuItem onClick={handleDownload}>{t('download')}</MenuItem>
            <MenuItem onClick={handleShare}>{t('share')}</MenuItem>
            {selectMode ? (
                <MenuItem onClick={handleToggleSelect}>{t('select')}</MenuItem>
            ) : (
                <MenuItem onClick={handleSelectMode}>{t('select')}</MenuItem>
            )}
            <MenuItem onClick={handleFavorite}>{file.is_favorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
            <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
        </Menu>
    );
};

export default FileActions;
