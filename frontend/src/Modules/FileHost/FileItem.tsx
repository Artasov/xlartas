import React, {useState} from 'react';
import {Menu, MenuItem, IconButton, Checkbox} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {IFile} from './types';
import {useApi} from '../Api/useApi';
import {FRSE} from 'wide-containers';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

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

const FileItem: React.FC<Props> = ({file, selectMode, selected, onToggleSelect, onFavorite, onDelete, onDownload, onShare, onSelectMode}) => {
    const {api} = useApi();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleFav = () => {
        api.post('/api/v1/filehost/files/toggle_favorite/', {file_id: file.id}).then((d) => {
            onFavorite && onFavorite({...file, is_favorite: d.is_favorite});
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
        <FRSE p={0.5} borderBottom={'1px solid #ccc'} onClick={handleClick} onContextMenu={(e)=>{e.preventDefault();setAnchorEl(e.currentTarget);}}>
            {selectMode && <Checkbox size="small" checked={selected} onChange={handleToggleSelect}/>} 
            <span style={{flexGrow:1}}>{file.name}</span>
            <FRSE g={0.5}>
                <IconButton size="small" onClick={(e)=>{e.stopPropagation();toggleFav();}}
                            sx={{color:file.is_favorite? '#fbc02d': 'inherit'}}>
                    {file.is_favorite ? <StarIcon fontSize="small"/> : <StarBorderIcon fontSize="small"/>}
                </IconButton>
                <IconButton size="small" onClick={(e) => {e.stopPropagation();setAnchorEl(e.currentTarget);}}>
                    <MoreVertIcon fontSize="small"/>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={handleDownload}>{t('download')}</MenuItem>
                    <MenuItem onClick={handleShare}>{t('share')}</MenuItem>
                    {selectMode ? (
                        <MenuItem onClick={handleToggleSelect}>{t('select')}</MenuItem>
                    ) : (
                        <MenuItem onClick={handleSelectMode}>{t('select')}</MenuItem>
                    )}
                    <MenuItem onClick={toggleFav}>{file.is_favorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
                    <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
                </Menu>
            </FRSE>
        </FRSE>
    );
};

export default FileItem;
