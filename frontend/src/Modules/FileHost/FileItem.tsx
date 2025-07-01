import React, {useState} from 'react';
import {Menu, MenuItem, IconButton} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {IFile} from './types';
import {useApi} from '../Api/useApi';
import {FRSE} from 'wide-containers';

interface Props {
    file: IFile;
    onFavorite?: (f: IFile) => void;
    onDelete?: (f: IFile) => void;
}

const FileItem: React.FC<Props> = ({file, onFavorite, onDelete}) => {
    const {api} = useApi();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleFav = () => {
        api.post('/api/v1/filehost/files/toggle_favorite/', {file_id: file.id}).then((d) => {
            onFavorite && onFavorite({...file, is_favorite: d.is_favorite});
        });
    };

    const handleDelete = () => {
        onDelete && onDelete(file);
    };

    return (
        <FRSE p={0.5} borderBottom={'1px solid #ccc'}>
            <span>{file.name}</span>
            <FRSE g={0.5}>
                {file.is_favorite ? <StarIcon fontSize="small"/> : <StarBorderIcon fontSize="small"/>}
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVertIcon fontSize="small"/>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={toggleFav}>{file.is_favorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
            </FRSE>
        </FRSE>
    );
};

export default FileItem;
