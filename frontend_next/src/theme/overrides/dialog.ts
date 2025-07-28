// theme/overrides/dialog.ts
import {Grow} from '@mui/material';
import {ThemeOptions} from '@mui/material/styles';

const dialogOverrides: ThemeOptions['components'] = {
    MuiDialog: {
        styleOverrides: {
            paper: {
                width: 'fit-content',
                borderRadius: '1.2rem',
                margin: '0.5rem',
                padding: 0,
                transition: 'width .3s, height .3s',
            },
        },
        defaultProps: {
            fullWidth: true,
            maxWidth: 'sm',
            slots: {transition: Grow},
            slotProps: {transition: {timeout: 350}},
        },
    },
    MuiDialogContent: {
        styleOverrides: {
            root: {},
        },
    },
    MuiModal: {
        styleOverrides: {
            root: {
                color: '#ffffff',
            },
        },
    },
    MuiMenu: {
        styleOverrides: {
            paper: {
                backdropFilter: 'blur(15px)',
            },
        },
    },
    MuiBackdrop: {
        styleOverrides: {
            root: {
                '&.MuiBackdrop-invisible': {
                    backdropFilter: 'none',
                },
                backdropFilter: 'blur(15px)',
                transition: 'backdrop-filter .35s ease, opacity .35s ease', // скрываем скроллбары полностью
                msOverflowStyle: 'none',
                overflow: 'hidden',
                '&::-webkit-scrollbar': {
                    width: 0,
                    height: 0,
                },
            },
        },
    },
};

export default dialogOverrides;
