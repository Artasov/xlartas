// Modules/Order/CircularProgressZoomify.tsx
import React from 'react';
import Zoom from '@mui/material/Zoom';
import {FRCC} from 'wide-containers';
import CircularProgress from './CircularProgress';

type FRCCProps = React.ComponentProps<typeof FRCC>;

interface CircularProgressZoomifyProps extends Omit<FRCCProps, 'children'> {
    /** Управляет появлением/скрытием анимации */
    in: boolean;
    /** Диаметр индикатора (по умолчанию — '90px') */
    size?: number | string;
}

const CircularProgressZoomify: React.FC<CircularProgressZoomifyProps> = (
    {
        in: inProp,
        size = '90px',
        sx,
        ...frccProps
    }
) => (
    <Zoom
        in={inProp}
        appear
        mountOnEnter
        unmountOnExit
        timeout={{enter: 500, exit: 600}}
    >
        <FRCC
            w={'100%'}
            pos={'absolute'}
            top={0}
            left={0}
            right={0}
            zIndex={1}
            sx={sx}
            {...frccProps}
        >
            <CircularProgress size={size}/>
        </FRCC>
    </Zoom>
);

export default CircularProgressZoomify;
