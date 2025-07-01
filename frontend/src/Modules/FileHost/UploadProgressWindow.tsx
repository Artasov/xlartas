import React from 'react';
import {LinearProgress, Paper} from '@mui/material';
import {FC} from 'wide-containers';

export interface UploadItem {name:string; progress:number;}

interface Props {items: UploadItem[];}

const UploadProgressWindow: React.FC<Props> = ({items}) => (
    <Paper sx={{position:'fixed',bottom:16,right:16,p:2,width:250,zIndex:9999}}>
        <FC g={1}>
            {items.map(it=> (
                <div key={it.name} style={{display:'flex',flexDirection:'column',gap:4}}>
                    <span style={{fontSize:'0.8rem'}}>{it.name}</span>
                    <LinearProgress variant="determinate" value={it.progress}/>
                </div>
            ))}
        </FC>
    </Paper>
);

export default UploadProgressWindow;
