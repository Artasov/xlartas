import React from 'react';
import {IconButton} from '@mui/material';
import {Close} from '@mui/icons-material';
import {useStyles} from "../../core/components/Theme/useStyles";

const Tag = ({tag, deleteBtnVisible, onDelete, className, onClick}) => {
    const classes = useStyles();
    return (
        <div
            className={`${className} frcc ${deleteBtnVisible ? 'pe-2px' : 'pe-2'} ps-2 fs-6 text-white rounded-4 w-min`}
            style={{
                backgroundColor: tag.color,
                whiteSpace: 'pre',
                wordBreak: 'keep-all',
            }}
            onClick={() => onClick ? onClick() : ''}
        >
            <span>{tag.name}</span>
            {deleteBtnVisible && (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tag.id);
                    }}
                    style={{color: '#fff'}}
                >
                    <Close fontSize="inherit" className={'p-0'}/>
                </IconButton>
            )}
        </div>
    );
};

export default Tag;
