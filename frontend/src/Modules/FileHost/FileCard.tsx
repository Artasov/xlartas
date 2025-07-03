import React, {useEffect, useState} from 'react';
import {Checkbox, IconButton, Paper} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import {useNavigate} from 'react-router-dom';
import {useApi} from '../Api/useApi';
import {IFile} from './types';
import formatFileSize from 'Utils/formatFileSize';
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

const FileCard: React.FC<Props> = ({file, selectMode, selected, onToggleSelect, onFavorite, onDelete, onDownload, onShare, onSelectMode}) => {
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
        <Paper sx={{p:1,width:150}}
               onClick={handleClick}
               onContextMenu={e=>{e.preventDefault();setAnchorEl(e.currentTarget);}}
               {...longPress}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {selectMode && <Checkbox size="small" checked={selected} onChange={handleToggleSelect}/>} 
                {favorite && (
                    <IconButton size="small" onClick={e=>{e.stopPropagation();toggleFav();}} sx={{color:'#fbc02d'}}>
                        <StarIcon fontSize="small"/>
                    </IconButton>
                )}
                <IconButton size="small" onClick={e=>{e.stopPropagation();setAnchorEl(e.currentTarget);}}>
                    <MoreVertIcon fontSize="small"/>
                </IconButton>
            </div>
            <div style={{wordBreak:'break-all',fontSize:'0.9rem'}}>{file.name}</div>
            <div style={{fontSize:'0.75rem',color:'#666'}}>{new Date(file.created_at).toLocaleDateString()} · {formatFileSize(file.size)}</div>
            <FileActions
                anchorEl={anchorEl}
                file={{...file, is_favorite: favorite}}
                selectMode={selectMode}
                selected={selected}
                onClose={()=>setAnchorEl(null)}
                onToggleSelect={onToggleSelect}
                onSelectMode={onSelectMode}
                onDelete={onDelete}
                onDownload={onDownload}
                onShare={onShare}
                onToggleFavorite={() => {toggleFav();}}
            />
        </Paper>
    );
};

export default FileCard;
