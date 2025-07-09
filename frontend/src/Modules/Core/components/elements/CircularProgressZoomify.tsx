import React from 'react';
import Zoom from '@mui/material/Zoom';
import {FRCC} from 'wide-containers';
import CircularProgress from './CircularProgress';

interface CircularProgressZoomifyProps {
    in: boolean;
    size?: number | string;
}

const CircularProgressZoomify: React.FC<CircularProgressZoomifyProps> = ({in: inProp, size = '90px'}) => (
    <Zoom
        in={inProp}
        appear
        mountOnEnter
        unmountOnExit
        timeout={{enter: 300, exit: 300}}
    >
        <FRCC
            mt={5}
            w="100%"
            position="absolute"
            top={0}
            left={0}
            right={0}
            zIndex={1}
        >
            <CircularProgress size={size}/>
        </FRCC>
    </Zoom>
);

export default CircularProgressZoomify;
