import React, {useState} from 'react';
import {Menu, MenuItem, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import RenameDialog from './RenameDialog';
import {useApi} from '../Api/useApi';
import useLongPress from './useLongPress';

interface Props {
    id: number;
    name: string;
    onDelete?: (id: number) => void;
    onRenamed?: () => void;
}

const FolderCard: React.FC<Props> = ({id, name, onDelete, onRenamed}) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {api} = useApi();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showRename, setShowRename] = useState(false);
    const longPress = useLongPress(e => setAnchorEl(e.currentTarget as HTMLElement));

    const open = () => navigate(`/storage/master/${id}/`);
    const handleDelete = async () => {
        onDelete && onDelete(id);
        setAnchorEl(null);
    };

    return (
        <>
            <Paper sx={{p:1,width:150,cursor:'pointer'}} onDoubleClick={open}
                   onContextMenu={e=>{e.preventDefault();setAnchorEl(e.currentTarget);}}
                   {...longPress}>
                <strong style={{wordBreak:'break-all'}}>{name}</strong>
            </Paper>
            <Menu
                slotProps={{backdrop:{sx:{backdropFilter:'none !important'}}}}
                anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
                <MenuItem onClick={()=>{setShowRename(true); setAnchorEl(null);}}>{t('rename')}</MenuItem>
                <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
            </Menu>
            <RenameDialog open={showRename} id={id} name={name} onClose={()=>setShowRename(false)} onRenamed={onRenamed}/>
        </>
    );
};

export default FolderCard;
