import React, {useState} from 'react';
import {Checkbox, IconButton, Menu, MenuItem, Paper} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {useNavigate} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import formatFileSize from 'Utils/formatFileSize';
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

const FileCard: React.FC<Props> = ({file, selectMode, selected, onToggleSelect, onFavorite, onDelete, onDownload, onShare, onSelectMode}) => {
    const {api} = useApi();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleFav = () => {
        api.post('/api/v1/filehost/files/toggle_favorite/', {file_id: file.id}).then(d => {
            onFavorite && onFavorite({...file, is_favorite: d.is_favorite});
        });
    };

    const handleDelete = () => { onDelete && onDelete(file); setAnchorEl(null); };
    const handleDownload = () => { onDownload && onDownload(file); setAnchorEl(null); };
    const handleShare = () => { onShare && onShare(file); setAnchorEl(null); };
    const handleSelectMode = () => { onSelectMode && onSelectMode(file); setAnchorEl(null); };
    const handleToggleSelect = () => { onToggleSelect && onToggleSelect(file); setAnchorEl(null); };

    const handleClick = () => {
        if (anchorEl) {
            setAnchorEl(null);
            return;
        }
        if (selectMode) {
            onToggleSelect && onToggleSelect(file);
        } else {
            navigate(`/storage/files/${file.id}/`);
        }
    };

    return (
        <Paper sx={{p:1,width:150}} onClick={handleClick} onContextMenu={e=>{e.preventDefault();setAnchorEl(e.currentTarget);}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {selectMode && <Checkbox size="small" checked={selected} onChange={handleToggleSelect}/>} 
                <IconButton size="small" onClick={e=>{e.stopPropagation();toggleFav();}} sx={{color:file.is_favorite? '#fbc02d':'inherit'}}>
                    {file.is_favorite ? <StarIcon fontSize="small"/> : <StarBorderIcon fontSize="small"/>}
                </IconButton>
                <IconButton size="small" onClick={e=>{e.stopPropagation();setAnchorEl(e.currentTarget);}}>
                    <MoreVertIcon fontSize="small"/>
                </IconButton>
            </div>
            <div style={{wordBreak:'break-all',fontSize:'0.9rem'}}>{file.name}</div>
            <div style={{fontSize:'0.75rem',color:'#666'}}>{new Date(file.created_at).toLocaleDateString()} · {formatFileSize(file.size)}</div>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
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
        </Paper>
    );
};

export default FileCard;
