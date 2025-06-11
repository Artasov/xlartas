import React from 'react';
import {useScreen} from './ScreenViewerProvider';
import {FCCC} from 'wide-containers';
import CircularProgress from 'Core/components/elements/CircularProgress';

const ScreenViewer: React.FC<{
    className?: string;
    style?: React.CSSProperties;
}> = ({className, style}) => {
    const {frame, readyState} = useScreen();

    if (readyState !== WebSocket.OPEN)
        return <FCCC cls={className} style={style}><CircularProgress size="90px"/></FCCC>;

    return (
        <img
            className={className}
            style={{maxWidth: '100%', ...style}}
            src={frame ? `data:image/jpeg;base64,${frame}` : undefined}
            alt="live-screen"
        />
    );
};

export default ScreenViewer;
