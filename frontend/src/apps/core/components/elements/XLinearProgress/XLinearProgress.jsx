import React from 'react';
import { LinearProgress } from '@mui/material';
import './XLinearProgress.css';
import {useStyles} from "../../Theme/useStyles";

const XLinearProgress = ({ value }) => {
    const classes = useStyles();
    return (
        <div className="xlinear-progress">
            <LinearProgress
                variant="determinate"
                value={value}
                style={{ height: '10px' }}
                classes={{
                    root: `xlinear-progress-root rounded-2 bg-transparent border border-1 ${classes.borderContrast10}`,
                    bar: `xlinear-progress-bar rounded-2 ${classes.bgContrast50}`
                }}
            />
        </div>
    );
};

export default XLinearProgress;
