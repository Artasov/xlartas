import React, {useEffect, useState} from 'react';
import {Collapse, CollapseProps} from '@mui/material';

interface Props extends Omit<CollapseProps, 'in'> {
    children: React.ReactNode;
}

const ExpandOnMount: React.FC<Props> = ({children, timeout = 350, ...rest}) => {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const id = setTimeout(() => setOpen(true), 0);
        return () => clearTimeout(id);
    }, []);

    return (
        <Collapse in={open} timeout={timeout} {...rest}>
            {children}
        </Collapse>
    );
};

export default ExpandOnMount;
