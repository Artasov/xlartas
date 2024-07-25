import React from 'react';

const SoftwareImage = ({url, size}) => {
    const imageStyle = {
        minWidth: size,
        width: size,
        maxWidth: size,
        minHeight: size,
        height: size,
        maxHeight: size,
        aspectRatio: '1 / 1',
    };

    const blurStyle = {
        filter: 'blur(10px) saturate(4)',
        zIndex: 0,
    };

    return (
        <div style={imageStyle} className={'position-relative'}>
            <img src={url}
                 style={{opacity: '75%', zIndex: 1, position: 'absolute'}}
                 className={'w-100 h-100'}
                 alt=""/>
            <img src={url}
                 className={'position-absolute left-0 top-0 w-100 h-100 rotate360anim opacity-75'}
                 style={blurStyle}
                 alt=""/>
        </div>
    );
};

export default SoftwareImage;
