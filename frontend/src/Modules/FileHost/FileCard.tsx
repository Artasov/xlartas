import React, {useEffect, useState} from 'react';
import {Checkbox, IconButton, Paper} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import {useNavigate} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import formatFileSize from 'Utils/formatFileSize';
import {useTranslation} from 'react-i18next';
import useLongPress from './useLongPress';
import FileActions from './FileActions';
import {setAllFilesCached, setFavoriteFilesCached, setFolderCached} from './storageCache';
import {FC, FR, FRBC} from "wide-containers";

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

const FileCard: React.FC<Props> = (
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
    const {api} = useApi();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [favorite, setFavorite] = useState(file.is_favorite);

    useEffect(() => setFavorite(file.is_favorite), [file.is_favorite]);

    const longPress = useLongPress(e => setAnchorEl(e.currentTarget as HTMLElement));

    const toggleFav = () => {
        api.post('/api/v1/filehost/files/toggle_favorite/', {file_id: file.id}).then(d => {
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
        if (anchorEl) {
            setAnchorEl(null);
            return;
        }
        if (selectMode) onToggleSelect && onToggleSelect(file);
        else navigate(`/storage/files/${file.id}/`);
    };

    return (
        <Paper sx={{px: 1, pt: 1, pb: .5, width: 150}}
               onClick={handleClick} onContextMenu={e => {
            e.preventDefault();
            setAnchorEl(e.currentTarget);
        }} {...longPress}>
            <FC h={'100%'}>
                <FRBC>
                    {selectMode && (
                        <Checkbox
                            sx={{p: .4, ml: -.7, mt: -.7}}
                            size="small"
                            checked={selected}
                            onChange={handleToggleSelect}
                            onClick={e => e.stopPropagation()}
                        />
                    )}
                    {favorite && (
                        <IconButton size="small" onClick={e => {
                            e.stopPropagation();
                            toggleFav();
                        }} sx={{color: '#fbc02d'}}>
                            <StarIcon fontSize="small"/>
                        </IconButton>
                    )}
                </FRBC>
                <FR fontSize={'0.9rem'} sx={{wordBreak: 'break-all'}}>
                    {file.name}
                </FR>
                <FR mt={'auto'} fontSize={'0.75rem'} color={'#666'}>
                    {new Date(file.created_at).toLocaleDateString()} · {formatFileSize(file.size)}
                </FR>
                <FileActions
                    anchorEl={anchorEl}
                    file={{...file, is_favorite: favorite}}
                    selectMode={selectMode}
                    selected={selected}
                    onClose={() => setAnchorEl(null)}
                    onToggleSelect={onToggleSelect}
                    onSelectMode={onSelectMode}
                    onDelete={onDelete}
                    onDownload={onDownload}
                    onShare={onShare}
                    onToggleFavorite={() => {
                        toggleFav();
                    }}
                />
            </FC>
        </Paper>
    );
};

export default FileCard;
