import React, {useEffect, useRef, useState} from 'react';
import {Box, Fade} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {keyframes} from '@emotion/react';
import {useStyles} from "../Theme/useStyles";

const bounce = keyframes`
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(10px);
    }
`;

const ScrollAvailableHint = ({direction, position = {}}) => {
    const [visible, setVisible] = useState(false);
    const hintRef = useRef(null);
    const classes = useStyles();

    const handleScroll = () => {
        setVisible(false);
    };

    useEffect(() => {
        const parentElement = hintRef.current.parentElement;
        if (parentElement) {
            const {scrollHeight, clientHeight, scrollWidth, clientWidth} = parentElement;
            if (direction === 'up' || direction === 'down') {
                console.log(scrollHeight)
                console.log(clientHeight)
                if (scrollHeight > clientHeight) {
                    setVisible(true);
                }
            } else if (direction === 'left' || direction === 'right') {
                if (scrollWidth > clientWidth) {
                    setVisible(true);
                }
            }
            parentElement.addEventListener('scroll', handleScroll);
            return () => parentElement.removeEventListener('scroll', handleScroll);
        }
    }, []);

    let ArrowIcon;
    switch (direction) {
        case 'up':
            ArrowIcon = ArrowUpwardIcon;
            break;
        case 'down':
            ArrowIcon = ArrowDownwardIcon;
            break;
        case 'left':
            ArrowIcon = ArrowBackIcon;
            break;
        case 'right':
            ArrowIcon = ArrowForwardIcon;
            break;
        default:
            ArrowIcon = ArrowDownwardIcon;
    }

    return (
        <Fade in={visible} timeout={300}>
            <Box
                className={`${classes.bgContrast65}`}
                ref={hintRef}
                sx={{
                    position: 'absolute',
                    ...position,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    color: '#fff',
                    animation: `${bounce} 1.5s infinite`
                }}
            >
                <ArrowIcon className={`${classes.textContrast90}`}/>
            </Box>
        </Fade>
    );
};
export default ScrollAvailableHint;

//  <ScrollAvailableHint direction="down" position={{ bottom: '10px', right: '10px' }} />
//  <ScrollAvailableHint direction="up" position={{ top: '10px', right: '10px' }} />
//  <ScrollAvailableHint direction="left" position={{ top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
//  <ScrollAvailableHint direction="right" position={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }} />
