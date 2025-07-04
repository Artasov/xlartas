import React, {useState} from 'react';
import {LinearProgress, Paper, IconButton, Button} from '@mui/material';
import {FC, FRSE} from 'wide-containers';
import CheckIcon from '@mui/icons-material/Check';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface UploadItem {name:string; progress:number; done?:boolean; file?: any;}

interface Props {items: UploadItem[]; onClose?:()=>void;}

const UploadProgressWindow: React.FC<Props> = ({items, onClose}) => {
    const [collapsed, setCollapsed] = useState(false);
    const allDone = items.length>0 && items.every(it=>it.progress===100);
    return (
        <Paper sx={{position:'fixed',bottom:16,right:16,p:2,width:250,zIndex:9999}}>
            <IconButton size="small" onClick={()=>setCollapsed(o=>!o)} sx={{position:'absolute',top:4,right:4}}>
                {collapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
            </IconButton>
            {allDone && (
                <IconButton size="small" onClick={onClose} sx={{position:'absolute',top:4,left:4}}>
                    <CheckIcon color="success"/>
                </IconButton>
            )}
            {!collapsed && (
                <FC g={1} mt={2}>
                    {items.map(it=> (
                        <div key={it.name} style={{display:'flex',flexDirection:'column',gap:4}}>
                            <span style={{fontSize:'0.8rem'}}>{it.name}</span>
                            {it.progress === 100 ? (
                                <FRSE>
                                    <CheckIcon color="success" fontSize="small"/>
                                    <Button size="small">Share</Button>
                                </FRSE>
                            ) : (
                                <LinearProgress variant="determinate" value={it.progress}/>
                            )}
                        </div>
                    ))}
                </FC>
            )}
        </Paper>
    );
};

export default UploadProgressWindow;
