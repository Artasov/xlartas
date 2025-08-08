// Modules/FileHost/FileItem.tsx
import React, {useEffect, useState} from 'react';
import {IconButton, Menu, MenuItem} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import {IFile} from './types';
import {FRSE} from 'wide-containers';
import {useNavigate} from 'Utils/nextRouter';
import {useTranslation} from 'react-i18next';
import {setAllFilesCached, setFavoriteFilesCached, setFolderCached} from './storageCache';
import {useFileHostApi} from "Modules/FileHost/useFileHostApi";

interface Props {
    file: IFile;
    selectMode?: boolean;
    selected?: boolean;
    onToggleSelect?: (f: IFile) => void;
    onFavorite?: (f: IFile) => void;
    onDelete?: (f: IFile) => void;
    onDownload?: (f: IFile) => void;
    onShare?: (f: IFile) => void;
    onSelectMode?: (f: IFile) => void;
}

const FileItem: React.FC<Props> = (
    {
        file,
        selectMode,
        selected,
        onToggleSelect,
        onFavorite,
        onDelete,
        onDownload,
        onShare,
        onSelectMode
    }) => {
    const {toggleFavorite} = useFileHostApi();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [favorite, setFavorite] = useState(file.is_favorite);

    useEffect(() => setFavorite(file.is_favorite), [file.is_favorite]);

    const toggleFav = () => {
        toggleFavorite(file.id).then((d) => {
            setFavorite(d.is_favorite);
            onFavorite && onFavorite({...file, is_favorite: d.is_favorite});
            setFavoriteFilesCached(undefined as any);
            setAllFilesCached(undefined as any);
            setFolderCached(file.folder, undefined as any);
        });
    };

    const handleDelete = () => {
        onDelete && onDelete(file);
        setAnchorEl(null);
    };

    const handleDownload = () => {
        onDownload && onDownload(file);
        setAnchorEl(null);
    };

    const handleShare = () => {
        onShare && onShare(file);
        setAnchorEl(null);
    };

    const handleSelectMode = () => {
        onSelectMode && onSelectMode(file);
        setAnchorEl(null);
    };

    const handleToggleSelect = () => {
        onToggleSelect && onToggleSelect(file);
        setAnchorEl(null);
    };

    const handleClick = () => {
        if (selectMode) {
            onToggleSelect && onToggleSelect(file);
        } else {
            navigate(`/storage/files/${file.id}/`);
        }
    };

    return (
        <FRSE p={0.5} borderBottom={'1px solid #ccc'} onClick={handleClick} onContextMenu={(e) => {
            e.preventDefault();
            setAnchorEl(e.currentTarget);
        }}>
            {selectMode && <></>}
            <span style={{flexGrow: 1}}>{file.name}</span>
            <FRSE g={0.5}>
                {favorite && (
                    <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        toggleFav();
                    }}
                                sx={{color: '#fbc02d'}}>
                        <StarIcon fontSize="small"/>
                    </IconButton>
                )}

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={handleDownload}>{t('download')}</MenuItem>
                    <MenuItem onClick={handleShare}>{t('share')}</MenuItem>
                    {selectMode ? (
                        <MenuItem onClick={handleToggleSelect}>{t('select')}</MenuItem>
                    ) : (
                        <MenuItem onClick={handleSelectMode}>{t('select')}</MenuItem>
                    )}
                    <MenuItem onClick={toggleFav}>{favorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
                    <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
                </Menu>
            </FRSE>
        </FRSE>
    );
};

export default FileItem;
