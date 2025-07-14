import {ThemeOptions} from '@mui/material/styles';

const commonOverrides: ThemeOptions['components'] = {
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
                backgroundColor: '#ffffff0d',
            },
        },
    },
    MuiSvgIcon: {
        styleOverrides: {
            root: {
                color: '#ffffff',
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                padding: '.1rem',
            },
        },
    },
    MuiTypography: {
        styleOverrides: {
            root: {},
            h1: {
                lineHeight: '1em',
                color: '#ffffff',
            },
            h2: {
                lineHeight: '1em',
                color: '#ffffffee',
            },
            h3: {
                lineHeight: '1em',
                color: '#ffffffdd',
            },
            h4: {
                lineHeight: '1em',
                color: '#ffffffcc',
            },
            h5: {
                lineHeight: '1em',
                color: '#ffffffcc',
            },
            h6: {
                lineHeight: '1em',
                color: '#ffffffcc',
            },
            body1: {
                lineHeight: '1.2em',
                color: '#ffffff99',
            },
            body2: {
                lineHeight: '1.2em',
                color: '#ffffff77',
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '.5rem',
                backgroundColor: 'rgba(0,0,0,0)',
                padding: '0',
                boxShadow: `0 0 10px #0002`,
                transition: 'all 200ms ease-in-out',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 0 0 #0002`,
                },
            },
        },
    },
    MuiCardContent: {
        styleOverrides: {
            root: {
                padding: '.5rem 1rem',
                '&:last-child': {
                    paddingBottom: '.5rem',
                },
            },
        },
    },
    MuiRadio: {
        styleOverrides: {
            root: {
                color: 'rgba(255,255,255,0.6)',
                '&.Mui-checked': {
                    // @ts-ignore
                    color: '#4fa7ce',
                },
            },
        },
    },
    MuiCheckbox: {
        styleOverrides: {
            root: {
                color: 'rgba(255,255,255,0.6)',
                '&.Mui-checked': {
                    // @ts-ignore
                    color: '#4fa7ce',
                },
            },
        },
    },
};

export default commonOverrides;
