// Modules/Theme/Theme.tsx
import {createTheme} from '@mui/material/styles';

export const lightTheme = createTheme({});

export const darkTheme = createTheme({
    // @ts-ignore
    colors: {
        primary: {
            dark: '#e65a6a',
            main: '#fe586b',
            light: '#ff808e',
            lighter: '#fff3f2',
        },
        secondary: {
            dark: '#303189',
            main: '#4f50ab',
            light: '#8485c4',
            lighter: '#f0f0fa',
        },
        error: {
            dark: '#b34452',
            main: '#ff6a7d',
            light: '#ff8796',
        },
        warning: {
            main: '#ffa000',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        info: {
            main: '#0288d1',
            light: '#4fc3f7',
            dark: '#01579b',
        },
        success: {
            main: '#65ff6c',
            light: '#81c784',
            dark: '#2e7d32',
        },
    },
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                /* Все иконки по умолчанию белые;
                   если в компоненте указан prop color="primary|error|…",
                   он естественно перекроет это значение. */
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
                },
                h2: {
                    lineHeight: '1em',
                },
                h3: {
                    lineHeight: '1em',
                },
                h4: {
                    lineHeight: '1em',
                },
                h5: {
                    lineHeight: '1em',
                },
                h6: {
                    lineHeight: '1em',
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
        MuiButton: {
            styleOverrides: {
                root: {
                    lineHeight: '1em',
                    padding: '.6em 1em .5em 1em',
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(15px)',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 0,
                    /* убираем нижний отступ, делаем компактнее */
                },
                indicator: {
                    height: '3px',
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: '#fe586b', // цвета primary.main
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 0,
                    minWidth: 100,
                    padding: '0.6rem 1.2rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#ffffff',
                    opacity: 0.7,
                    transition: 'color 120ms ease, opacity 120ms ease',
                    '&.Mui-selected': {
                        color: '#fe586b',
                        opacity: 1,
                        fontWeight: 600,
                    },
                    '&.Mui-disabled': {
                        opacity: 0.3,
                    },
                },
            },
        },
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#f7f7f7',
            light: '#f0f0f0',
            dark: '#e9e9e9',
            contrastText: '#000000',
        },
        secondary: {
            main: '#6d9bff',
            light: '#f8bbd0',
            dark: '#c2185b',
            contrastText: '#000',
        },
        text: {
            primary: '#ffffff',
            secondary: '#8e8e8e',
        },
        background: {default: '#000000', paper: '#363636'},
        error: {
            main: '#ff6a7d',
            light: '#e57373',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ffa726',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        info: {
            main: '#3c74e3',
            light: '#4b91ff',
            dark: '#1e5abb',
        },
        success: {
            main: '#77ff7d',
            light: '#74c978',
            dark: '#31a136',
        },
    },
});

export default darkTheme;