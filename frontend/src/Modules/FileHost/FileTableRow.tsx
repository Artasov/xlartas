import React, {useEffect, useState} from 'react';
import {Checkbox, IconButton, TableRow, TableCell, useMediaQuery} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import {IFile} from './types';
import formatFileSize from 'Utils/formatFileSize';
import {useApi} from '../Api/useApi';
import {FRSE} from 'wide-containers';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import useLongPress from './useLongPress';
import FileActions from './FileActions';

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

const FileTableRow: React.FC<Props> = ({
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
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [favorite, setFavorite] = useState(file.is_favorite);
    const isGtSm = useMediaQuery('(min-width: 576px)');

    useEffect(() => setFavorite(file.is_favorite), [file.is_favorite]);
    const longPress = useLongPress(e => setAnchorEl(e.currentTarget as HTMLElement));

    const toggleFav = () => {
        api.post('/api/v1/filehost/files/toggle_favorite/', {file_id: file.id}).then(d => {
            setFavorite(d.is_favorite);
            onFavorite && onFavorite({...file, is_favorite: d.is_favorite});
        });
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
        <TableRow
            hover
            onClick={handleClick}
            onContextMenu={e => {
                e.preventDefault();
                setAnchorEl(e.currentTarget);
            }}
            {...longPress}
            sx={{cursor: 'pointer'}}
        >
            {selectMode && (
                <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected} onChange={handleToggleSelect}
                              onClick={e => e.stopPropagation()}/>
                </TableCell>
            )}
            <TableCell component="th" scope="row" sx={{lineHeight: '1rem'}}>
                {file.name}
            </TableCell>
            {isGtSm && (
                <TableCell>{new Date(file.created_at).toLocaleString()}</TableCell>
            )}
            <TableCell>{formatFileSize(file.size)}</TableCell>
            <TableCell>
                <FRSE g={0.5}>
                    {favorite && (
                        <IconButton size="small" onClick={e => {
                            e.stopPropagation();
                            toggleFav();
                        }} sx={{color: '#fbc02d'}}>
                            <StarIcon fontSize="small"/>
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={e => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                    }}>
                        <MoreVertIcon fontSize="small"/>
                    </IconButton>
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
                </FRSE>
            </TableCell>
        </TableRow>
    );
};

export default FileTableRow;
