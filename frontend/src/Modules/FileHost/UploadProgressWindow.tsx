// Modules/FileHost/UploadProgressWindow.tsx
import React, {useState} from 'react';
import {Button, Collapse, IconButton, LinearProgress, Paper, useMediaQuery} from '@mui/material';
import {FC, FRB, FRSE} from 'wide-containers';
import CheckIcon from '@mui/icons-material/Check';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface UploadItem {
    name: string;
    progress: number;
    done?: boolean;
    file?: any;
}

interface Props {
    items: UploadItem[];
    onClose?: () => void;
    onShare?: (file: any) => void;
}

const UploadProgressWindow: React.FC<Props> = ({items, onClose, onShare}) => {
    const [collapsed, setCollapsed] = useState(false);
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const allDone = items.length > 0 && items.every(it => it.progress === 100);
    return (
        <Paper sx={{
            position: 'fixed',
            bottom: 16,
            right: isGtSm ? 16 : 'auto',
            left: isGtSm ? 'auto' : '50%',
            transform: isGtSm ? '' : 'translateX(-50%)',
            p: 2,
            width: 250,
            zIndex: 9999,
            backgroundColor: '#ffffff1b',
            backdropFilter: 'blur(10px)'
        }}>
            <FRB bg={'#ffffffff'}>
                <IconButton size="small" onClick={() => setCollapsed(o => !o)}
                            sx={{position: 'absolute', top: 4, right: 4}}>
                    {collapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
                </IconButton>
                {allDone && (
                    <IconButton size="small" onClick={onClose} sx={{position: 'absolute', top: 4, left: 4}}>
                        <CheckIcon color="success"/>
                    </IconButton>
                )}
            </FRB>
            <Collapse in={!collapsed}>
                <FC g={1} mt={2}>
                    {items.map(it => (
                        <div key={it.name} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            <span style={{fontSize: '0.8rem'}}>{it.name}</span>
                            {it.progress === 100 ? (
                                <FRSE>
                                    <CheckIcon color="success" fontSize="small"/>
                                    <Button size="small" onClick={() => onShare && it.file && onShare(it.file)}>
                                        Share
                                    </Button>
                                </FRSE>
                            ) : (
                                <LinearProgress variant="determinate" value={it.progress}/>
                            )}
                        </div>
                    ))}
                </FC>
            </Collapse>
        </Paper>
    );
};

export default UploadProgressWindow;
