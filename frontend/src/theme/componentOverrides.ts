import { Grow } from "@mui/material";
import { ThemeOptions } from "@mui/material/styles";

const componentOverrides: ThemeOptions["components"] = {
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
                    color: '#ffffff'
                },
                h2: {
                    lineHeight: '1em',
                    color: '#ffffffee'
                },
                h3: {
                    lineHeight: '1em',
                    color: '#ffffffdd'
                },
                h4: {
                    lineHeight: '1em',
                    color: '#ffffffcc'
                },
                h5: {
                    lineHeight: '1em',
                    color: '#ffffffcc'
                },
                h6: {
                    lineHeight: '1em',
                    color: '#ffffffcc'
                },
                body1: {
                    lineHeight: '1.2em',
                    color: '#ffffff99'
                },
                body2: {
                    lineHeight: '1.2em',
                    color: '#ffffff77'
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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#ffffff',
                    lineHeight: '1em',
                    padding: '.6em 1em .5em 1em',
                    backgroundColor: '#ffffff0d',
                    backdropFilter: 'blur(5px) saturate(180%)',
                    transition: 'transform 220ms ease-in-out, color 340ms ease, background-color 340ms ease',
                    '&:hover': {
                        color: '#000',
                        backgroundColor: '#ffffff',
                    },
                    '&:focus-visible': {
                        backgroundColor: '#ffffff0b',
                    },
                    '&.Mui-focusVisible': {backgroundColor: 'inherit'},

                    '&.Mui-disabled': {
                        color: '#888',
                        backgroundColor: '#ffffff0b',
                    },
                },
                contained: {
                    transition:
                        'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease, transform 200 ease-in-out',
                },
                outlined: {
                    transition:
                        'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease, transform 200 ease-in-out',
                },
                text: {
                    transition:
                        'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease, transform 200 ease-in-out',
                },
            },
        },
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
                slotProps: {transition: {timeout: 350}}
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
                    '-ms-overflow-style': 'none',            // IE и Edge
                    overflow: '-moz-scrollbars-none',        // Firefox
                    '&::-webkit-scrollbar': {                // Chrome, Safari и Opera
                        width: 0,
                        height: 0,
                    },
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
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#ffffff',
                    opacity: 0.7,
                    transition: 'color 120ms ease, opacity 120ms ease',
                    '&.Mui-selected': {
                        color: '#fe586b',
                        opacity: 1,
                    },
                    '&.Mui-disabled': {
                        opacity: 0.3,
                    },
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    /* базовый отступ снизу у свёрнутого аккордиона */
                    marginBottom: 0,

                    /* убираем нижний отступ, когда аккордион развёрнут */
                    '&.Mui-expanded': {
                        marginBottom: 0,
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    minHeight: '48px',            // базовая высота
                    '&.Mui-expanded': {
                        minHeight: '48px',          // остаётся такой же при раскрытии
                    },
                },
                /* контейнер с текстом/иконкой внутри хедера */
                content: {
                    margin: '12px 0',             // базовый вертикальный отступ
                    '&.Mui-expanded': {
                        margin: '12px 0',           // тот же при раскрытии
                    },
                },
            },
        },
};

export default componentOverrides;
