// Modules/Theme/Theme.tsx
import {createTheme} from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
    interface PaletteOptions {
        bg?: Record<string, string>;
        shadow?: Record<string, string>;
    }

    interface Palette {
        bg: Record<string, string>;
        shadow: Record<string, string>;
    }

    interface TypeText {
        [key: string]: string;
    }
}

export const lightTheme = createTheme({
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
            dark: '#f57c00',
            main: '#ffa000',
            light: '#ffb74d',
        },
        info: {
            dark: '#01579b',
            main: '#0288d1',
            light: '#4fc3f7',
        },
        success: {
            dark: '#2e7d32',
            main: '#65ff6c',
            light: '#81c784',
        },
    },
    typography: {
        fontFamily: 'Nunito, sans-serif',
        h1: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h1
        },
        h2: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h2
        },
        h3: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h2
        },
        h4: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h2
        },
        h5: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h2
        },
        h6: {
            color: 'rgba(0,0,0,.8)', // Цвет для заголовков h2
        },
        body1: {
            color: 'rgba(0,0,0,.7)', // Цвет для основного текста
        },
        body2: {
            color: 'rgba(0,0,0,.5)', // Цвет для второстепенного текста
        },
    },
    components: {
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: 'rgba(0,0,0,0.6)',
                    '&.Mui-checked': {
                        // @ts-ignore
                        color: '#4EAAA9',
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: 'rgba(0,0,0,0.6)',
                    '&.Mui-checked': {
                        // @ts-ignore
                        color: '#4EAAA9',
                    },
                },
            },
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: 'rgba(0,0,0,0.7)',
            light: '#757575',
            dark: '#292929',
        },
        secondary: {
            main: '#3cb6ff',
            light: '#5f5f5f',
            dark: '#9a0036',
        },
        text: {
            primary05: 'rgba(0,0,0,.05)',
            primary10: 'rgba(0,0,0,.1)',
            primary15: 'rgba(0,0,0,.15)',
            primary20: 'rgba(0, 0, 0, 0.2)',
            primary25: 'rgba(0,0,0,.25)',
            primary30: 'rgba(0,0,0,.3)',
            primary35: 'rgba(0,0,0,.35)',
            primary40: 'rgba(0,0,0,.4)',
            primary45: 'rgba(0,0,0,.45)',
            primary50: 'rgba(0,0,0,.5)',
            primary55: 'rgba(0,0,0,.55)',
            primary60: 'rgba(0,0,0,.6)',
            primary65: 'rgba(0,0,0,.65)',
            primary70: 'rgba(0,0,0,.7)',
            primary75: 'rgba(0,0,0,.75)',
            primary80: 'rgba(0,0,0,.8)',
            primary85: 'rgba(0,0,0,.85)',
            primary90: 'rgba(0,0,0,.9)',
            primary95: 'rgba(0,0,0,.95)',
            primary: '#000000',

            contrast05: 'rgba(255,255,255,.05)',
            contrast10: 'rgba(255,255,255,.1)',
            contrast15: 'rgba(255,255,255,.15)',
            contrast20: 'rgba(255,255,255,.2)',
            contrast25: 'rgba(255,255,255,.25)',
            contrast30: 'rgba(255,255,255,.3)',
            contrast35: 'rgba(255,255,255,.35)',
            contrast40: 'rgba(255,255,255,.4)',
            contrast45: 'rgba(255,255,255,.45)',
            contrast50: 'rgba(255,255,255,.5)',
            contrast55: 'rgba(255,255,255,.55)',
            contrast60: 'rgba(255,255,255,.6)',
            contrast65: 'rgba(255,255,255,.65)',
            contrast70: 'rgba(255,255,255,.7)',
            contrast75: 'rgba(255,255,255,.75)',
            contrast80: 'rgba(255,255,255,.8)',
            contrast85: 'rgba(255,255,255,.85)',
            contrast90: 'rgba(255,255,255,.9)',
            contrast95: 'rgba(255,255,255,.95)',
            contrast: '#ffffff',
            // @ts-ignore
            secondary: {
                main: '#84cbff',
                light: '#b8deff',
                lighter: '#e4f1ff',
                dark: '#a3c0e3',
            },
        },
        bg: {
            primary05: 'rgba(255,255,255,.05)',
            primary10: 'rgba(255,255,255,.1)',
            primary15: 'rgba(255,255,255,.15)',
            primary20: 'rgba(255,255,255,.2)',
            primary25: 'rgba(255,255,255,.25)',
            primary30: 'rgba(255,255,255,.3)',
            primary35: 'rgba(255,255,255,.35)',
            primary40: 'rgba(255,255,255,.4)',
            primary45: 'rgba(255,255,255,.45)',
            primary50: 'rgba(255,255,255,.5)',
            primary55: 'rgba(255,255,255,.55)',
            primary60: 'rgba(255,255,255,.6)',
            primary65: 'rgba(255,255,255,.65)',
            primary70: 'rgba(255,255,255,.7)',
            primary75: 'rgba(255,255,255,.75)',
            primary80: 'rgba(255,255,255,.8)',
            primary85: 'rgba(255,255,255,.85)',
            primary90: 'rgba(255,255,255,.9)',
            primary95: 'rgba(255,255,255,.95)',
            primary: '#ffffff',

            contrast05: 'rgba(0,0,0,.05)',
            contrast10: 'rgba(0,0,0,.1)',
            contrast15: 'rgba(0,0,0,.15)',
            contrast20: 'rgba(0,0,0,.2)',
            contrast25: 'rgba(0,0,0,.25)',
            contrast30: 'rgba(0,0,0,.3)',
            contrast35: 'rgba(0,0,0,.35)',
            contrast40: 'rgba(0,0,0,.4)',
            contrast45: 'rgba(0,0,0,.45)',
            contrast50: 'rgba(0,0,0,.5)',
            contrast55: 'rgba(0,0,0,.55)',
            contrast60: 'rgba(0,0,0,.6)',
            contrast65: 'rgba(0,0,0,.65)',
            contrast70: 'rgba(0,0,0,.7)',
            contrast75: 'rgba(0,0,0,.75)',
            contrast80: 'rgba(0,0,0,.8)',
            contrast85: 'rgba(0,0,0,.85)',
            contrast90: 'rgba(0,0,0,.9)',
            contrast95: 'rgba(0,0,0,.95)',
            contrast: '#000000',

            secondary: '#fd8657',
            tertiary: '#757575',
            quaternary: '#171717',
        },
        shadow: {
            // Outer white .6
            XXSO06: '0 0 .05em rgba(255, 255, 255, .6)',
            XSO06: '0 0 .1em rgba(255, 255, 255, .6)',
            SO06: '0 0 .2em rgba(255, 255, 255, .6)',
            MO06: '0 0 .5em rgba(255, 255, 255, .6)',
            LO06: '0 0 .7em rgba(255, 255, 255, .6)',
            XLO06: '0 0 1em rgba(255, 255, 255, .6)',
            XXLO06: '0 0 1.7em rgba(255, 255, 255, .6)',
            XXXLO06: '0 0 3em rgba(255, 255, 255, .6)',
            // Outer white .4
            XXSO04: '0 0 .05em rgba(255, 255, 255, .4)',
            XSO04: '0 0 .1em rgba(255, 255, 255, .4)',
            SO04: '0 0 .2em rgba(255, 255, 255, .4)',
            MO04: '0 0 .5em rgba(255, 255, 255, .4)',
            LO04: '0 0 .7em rgba(255, 255, 255, .4)',
            XLO04: '0 0 1em rgba(255, 255, 255, .4)',
            XXLO04: '0 0 1.7em rgba(255, 255, 255, .4)',
            XXXLO04: '0 0 3em rgba(255, 255, 255, .4)',
            // Outer white .2
            XXSO02: '0 0 .05em rgba(255, 255, 255, .2)',
            XSO02: '0 0 .1em rgba(255, 255, 255, .2)',
            SO02: '0 0 .2em rgba(255, 255, 255, .2)',
            MO02: '0 0 .5em rgba(255, 255, 255, .2)',
            LO02: '0 0 .7em rgba(255, 255, 255, .2)',
            XLO02: '0 0 1em rgba(255, 255, 255, .2)',
            XXLO02: '0 0 1.7em rgba(255, 255, 255, .2)',
            XXXLO02: '0 0 3em rgba(255, 255, 255, .2)',
            // Outer white .05

            XXSO005: '0 0 .05em rgba(255, 255, 255, .05)',
            XSO005: '0 0 .1em rgba(255, 255, 255, .05)',
            SO005: '0 0 .2em rgba(255, 255, 255, .05)',
            MO005: '0 0 .5em rgba(255, 255, 255, .05)',
            LO005: '0 0 .7em rgba(255, 255, 255, .05)',
            XLO005: '0 0 1em rgba(255, 255, 255, .05)',
            XXLO005: '0 0 1.7em rgba(255, 255, 255, .05)',
            XXXLO005: '0 0 3em rgba(255, 255, 255, .05)',
            // Inner white .6
            XXSI06: 'inset 0 0 .05em rgba(255, 255, 255, .6)',
            XSI06: 'inset 0 0 .1em rgba(255, 255, 255, .6)',
            SI06: 'inset 0 0 .2em rgba(255, 255, 255, .6)',
            MI06: 'inset 0 0 .5em rgba(255, 255, 255, .6)',
            LI06: 'inset 0 0 .7em rgba(255, 255, 255, .6)',
            XLI06: 'inset 0 0 1em rgba(255, 255, 255, .6)',
            XXLI06: 'inset 0 0 1.7em rgba(255, 255, 255, .6)',
            XXXLI06: 'inset 0 0 3em rgba(255, 255, 255, .6)',
            // Inner white .4
            XXSI04: 'inset 0 0 .05em rgba(255, 255, 255, .4)',
            XSI04: 'inset 0 0 .1em rgba(255, 255, 255, .4)',
            SI04: 'inset 0 0 .2em rgba(255, 255, 255, .4)',
            MI04: 'inset 0 0 .5em rgba(255, 255, 255, .4)',
            LI04: 'inset 0 0 .7em rgba(255, 255, 255, .4)',
            XLI04: 'inset 0 0 1em rgba(255, 255, 255, .4)',
            XXLI04: 'inset 0 0 1.7em rgba(255, 255, 255, .4)',
            XXXLI04: 'inset 0 0 3em rgba(255, 255, 255, .4)',
            // Inner white .2
            XXSI02: 'inset 0 0 .05em rgba(255, 255, 255, .2)',
            XSI02: 'inset 0 0 .1em rgba(255, 255, 255, .2)',
            SI02: 'inset 0 0 .2em rgba(255, 255, 255, .2)',
            MI02: 'inset 0 0 .5em rgba(255, 255, 255, .2)',
            LI02: 'inset 0 0 .7em rgba(255, 255, 255, .2)',
            XLI02: 'inset 0 0 1em rgba(255, 255, 255, .2)',
            XXLI02: 'inset 0 0 1.7em rgba(255, 255, 255, .2)',
            XXXLI02: 'inset 0 0 3em rgba(255, 255, 255, .2)',


            XXSI005: 'inset 0 0 .05em rgba(255, 255, 255, .05)',
            XSI005: 'inset 0 0 .1em rgba(255, 255, 255, .05)',
            SI005: 'inset 0 0 .2em rgba(255, 255, 255, .05)',
            MI005: 'inset 0 0 .5em rgba(255, 255, 255, .05)',
            LI005: 'inset 0 0 .7em rgba(255, 255, 255, .05)',
            XLI005: 'inset 0 0 1em rgba(255, 255, 255, .05)',
            XXLI005: 'inset 0 0 1.7em rgba(255, 255, 255, .05)',
            XXXLI005: 'inset 0 0 3em rgba(255, 255, 255, .05)',
            // CONTRAST
            // Outer .6
            XXSO06C: '0 0 .05em rgba(0, 0, 0, .6)',
            XSO06C: '0 0 .1em rgba(0, 0, 0, .6)',
            SO06C: '0 0 .2em rgba(0, 0, 0, .6)',
            MO06C: '0 0 .5em rgba(0, 0, 0, .6)',
            LO06C: '0 0 .7em rgba(0, 0, 0, .6)',
            XLO06C: '0 0 1em rgba(0, 0, 0, .6)',
            XXLO06C: '0 0 1.7em rgba(0, 0, 0, .6)',
            XXXLO06C: '0 0 3em rgba(0, 0, 0, .6)',
            // Outer .4
            XXSO04C: '0 0 .05em rgba(0, 0, 0, .4)',
            XSO04C: '0 0 .1em rgba(0, 0, 0, .4)',
            SO04C: '0 0 .2em rgba(0, 0, 0, .4)',
            MO04C: '0 0 .5em rgba(0, 0, 0, .4)',
            LO04C: '0 0 .7em rgba(0, 0, 0, .4)',
            XLO04C: '0 0 1em rgba(0, 0, 0, .4)',
            XXLO04C: '0 0 1.7em rgba(0, 0, 0, .4)',
            XXXLO04C: '0 0 3em rgba(0, 0, 0, .4)',
            // Outer .2
            XXSO02C: '0 0 .05em rgba(0, 0, 0, .2)',
            XSO02C: '0 0 .1em rgba(0, 0, 0, .2)',
            SO02C: '0 0 .2em rgba(0, 0, 0, .2)',
            MO02C: '0 0 .5em rgba(0, 0, 0, .2)',
            LO02C: '0 0 .7em rgba(0, 0, 0, .2)',
            XLO02C: '0 0 1em rgba(0, 0, 0, .2)',
            XXLO02C: '0 0 1.7em rgba(0, 0, 0, .2)',
            XXXLO02C: '0 0 3em rgba(0, 0, 0, .2)',


            XXSO005C: '0 0 .05em rgba(0, 0, 0, .05)',
            XSO005C: '0 0 .1em rgba(0, 0, 0, .05)',
            SO005C: '0 0 .2em rgba(0, 0, 0, .05)',
            MO005C: '0 0 .5em rgba(0, 0, 0, .05)',
            LO005C: '0 0 .7em rgba(0, 0, 0, .05)',
            XLO005C: '0 0 1em rgba(0, 0, 0, .05)',
            XXLO005C: '0 0 1.7em rgba(0, 0, 0, .05)',
            XXXLO005C: '0 0 3em rgba(0, 0, 0, .05)',
            // Inner .6
            XXSI06C: 'inset 0 0 .05em rgba(0, 0, 0, .6)',
            XSI06C: 'inset 0 0 .1em rgba(0, 0, 0, .6)',
            SI06C: 'inset 0 0 .2em rgba(0, 0, 0, .6)',
            MI06C: 'inset 0 0 .5em rgba(0, 0, 0, .6)',
            LI06C: 'inset 0 0 .7em rgba(0, 0, 0, .6)',
            XLI06C: 'inset 0 0 1em rgba(0, 0, 0, .6)',
            XXLI06C: 'inset 0 0 1.7em rgba(0, 0, 0, .6)',
            XXXLI06C: 'inset 0 0 3em rgba(0, 0, 0, .6)',
            // Inner .4
            XXSI04C: 'inset 0 0 .05em rgba(0, 0, 0, .4)',
            XSI04C: 'inset 0 0 .1em rgba(0, 0, 0, .4)',
            SI04C: 'inset 0 0 .2em rgba(0, 0, 0, .4)',
            MI04C: 'inset 0 0 .5em rgba(0, 0, 0, .4)',
            LI04C: 'inset 0 0 .7em rgba(0, 0, 0, .4)',
            XLI04C: 'inset 0 0 1em rgba(0, 0, 0, .4)',
            XXLI04C: 'inset 0 0 1.7em rgba(0, 0, 0, .4)',
            XXXLI04C: 'inset 0 0 3em rgba(0, 0, 0, .4)',
            // Inner .2
            XXSI02C: 'inset 0 0 .05em rgba(0, 0, 0, .2)',
            XSI02C: 'inset 0 0 .1em rgba(0, 0, 0, .2)',
            SI02C: 'inset 0 0 .2em rgba(0, 0, 0, .2)',
            MI02C: 'inset 0 0 .5em rgba(0, 0, 0, .2)',
            LI02C: 'inset 0 0 .7em rgba(0, 0, 0, .2)',
            XLI02C: 'inset 0 0 1em rgba(0, 0, 0, .2)',
            XXLI02C: 'inset 0 0 1.7em rgba(0, 0, 0, .2)',
            XXXLI02C: 'inset 0 0 3em rgba(0, 0, 0, .2)',
        },
        error: {
            main: '#ff4b63',
            light: '#e57373',
            dark: '#c62828',
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
            main: '#50c955',
            light: '#81c784',
            dark: '#2e7d32',
        },
    },
});
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
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#f7f7f7',
            light: '#f0f0f0',
            dark: '#e9e9e9',
            contrastText: '#fff',
        },
        secondary: {
            main: '#6d9bff',
            light: '#f8bbd0',
            dark: '#c2185b',
            contrastText: '#000',
        },
        text: {
            // @ts-ignore
            secondary: {
                main: '#84cbff',
                light: '#b8deff',
                lighter: '#e4f1ff',
                dark: '#a3c0e3',
            },
            primary05: 'rgba(255,255,255,.05)',
            primary10: 'rgba(255,255,255,.1)',
            primary15: 'rgba(255,255,255,.15)',
            primary20: 'rgba(255,255,255,.2)',
            primary25: 'rgba(255,255,255,.25)',
            primary30: 'rgba(255,255,255,.3)',
            primary35: 'rgba(255,255,255,.35)',
            primary40: 'rgba(255,255,255,.4)',
            primary45: 'rgba(255,255,255,.45)',
            primary50: 'rgba(255,255,255,.5)',
            primary55: 'rgba(255,255,255,.55)',
            primary60: 'rgba(255,255,255,.6)',
            primary65: 'rgba(255,255,255,.65)',
            primary70: 'rgba(255,255,255,.7)',
            primary75: 'rgba(255,255,255,.75)',
            primary80: 'rgba(255,255,255,.8)',
            primary85: 'rgba(255,255,255,.85)',
            primary90: 'rgba(255,255,255,.9)',
            primary95: 'rgba(255,255,255,.95)',
            primary: '#ffffff',

            contrast05: 'rgba(0,0,0,0.5)',
            contrast10: 'rgba(0,0,0,.1)',
            contrast15: 'rgba(0,0,0,.15)',
            contrast20: 'rgba(0,0,0,.2)',
            contrast25: 'rgba(0,0,0,.25)',
            contrast30: 'rgba(0,0,0,.3)',
            contrast35: 'rgba(0,0,0,.35)',
            contrast40: 'rgba(0,0,0,.4)',
            contrast45: 'rgba(0,0,0,.45)',
            contrast50: 'rgba(0,0,0,.5)',
            contrast55: 'rgba(0,0,0,.55)',
            contrast60: 'rgba(0,0,0,.6)',
            contrast65: 'rgba(0,0,0,.65)',
            contrast70: 'rgba(0,0,0,.7)',
            contrast75: 'rgba(0,0,0,.75)',
            contrast80: 'rgba(0,0,0,.8)',
            contrast85: 'rgba(0,0,0,.85)',
            contrast90: 'rgba(0,0,0,.9)',
            contrast95: 'rgba(0,0,0,.95)',
            contrast: '#000000',


            disabled: '#757575',
            hint: '#bdbdbd',
            contrastText: '#000',
            error: '#fff',
        },
        bg: {
            primary05: 'rgba(0,0,0,.05)',
            primary10: 'rgba(0,0,0,.1)',
            primary15: 'rgba(0,0,0,.15)',
            primary20: 'rgba(0,0,0,.2)',
            primary25: 'rgba(0,0,0,.25)',
            primary30: 'rgba(0,0,0,.3)',
            primary35: 'rgba(0,0,0,.35)',
            primary40: 'rgba(0,0,0,.4)',
            primary45: 'rgba(0,0,0,.45)',
            primary50: 'rgba(0,0,0,.5)',
            primary55: 'rgba(0,0,0,.55)',
            primary60: 'rgba(0,0,0,.6)',
            primary65: 'rgba(0,0,0,.65)',
            primary70: 'rgba(0,0,0,.7)',
            primary75: 'rgba(0,0,0,.75)',
            primary80: 'rgba(0,0,0,.8)',
            primary85: 'rgba(0,0,0,.85)',
            primary90: 'rgba(0,0,0,.9)',
            primary95: 'rgba(0,0,0,.95)',
            primary: '#09090a',

            contrast05: 'rgba(255,255,255,.05)',
            contrast10: 'rgba(255,255,255,.1)',
            contrast15: 'rgba(255,255,255,.15)',
            contrast20: 'rgba(255,255,255,.2)',
            contrast25: 'rgba(255,255,255,.25)',
            contrast30: 'rgba(255,255,255,.3)',
            contrast35: 'rgba(255,255,255,.35)',
            contrast40: 'rgba(255,255,255,.4)',
            contrast45: 'rgba(255,255,255,.45)',
            contrast50: 'rgba(255,255,255,.5)',
            contrast55: 'rgba(255,255,255,.55)',
            contrast60: 'rgba(255,255,255,.6)',
            contrast65: 'rgba(255,255,255,.65)',
            contrast70: 'rgba(255,255,255,.7)',
            contrast75: 'rgba(255,255,255,.75)',
            contrast80: 'rgba(255,255,255,.8)',
            contrast85: 'rgba(255,255,255,.85)',
            contrast90: 'rgba(255,255,255,.9)',
            contrast95: 'rgba(255,255,255,.95)',
            contrast: '#ffffff',

            tertiary: '#b2b2b2',
            quaternary: '#ebebeb',
        },
        shadow: {
            // Outer .6
            XXSO06: '0 0 .05em rgba(0, 0, 0, .6)',
            XSO06: '0 0 .1em rgba(0, 0, 0, .6)',
            SO06: '0 0 .2em rgba(0, 0, 0, .6)',
            MO06: '0 0 .5em rgba(0, 0, 0, .6)',
            LO06: '0 0 .7em rgba(0, 0, 0, .6)',
            XLO06: '0 0 1em rgba(0, 0, 0, .6)',
            XXLO06: '0 0 1.7em rgba(0, 0, 0, .6)',
            XXXLO06: '0 0 3em rgba(0, 0, 0, .6)',
            // Outer .4
            XXSO04: '0 0 .05em rgba(0, 0, 0, .4)',
            XSO04: '0 0 .1em rgba(0, 0, 0, .4)',
            SO04: '0 0 .2em rgba(0, 0, 0, .4)',
            MO04: '0 0 .5em rgba(0, 0, 0, .4)',
            LO04: '0 0 .7em rgba(0, 0, 0, .4)',
            XLO04: '0 0 1em rgba(0, 0, 0, .4)',
            XXLO04: '0 0 1.7em rgba(0, 0, 0, .4)',
            XXXLO04: '0 0 3em rgba(0, 0, 0, .4)',
            // Outer .2
            XXSO02: '0 0 .05em rgba(0, 0, 0, .2)',
            XSO02: '0 0 .1em rgba(0, 0, 0, .2)',
            SO02: '0 0 .2em rgba(0, 0, 0, .2)',
            MO02: '0 0 .5em rgba(0, 0, 0, .2)',
            LO02: '0 0 .7em rgba(0, 0, 0, .2)',
            XLO02: '0 0 1em rgba(0, 0, 0, .2)',
            XXLO02: '0 0 1.7em rgba(0, 0, 0, .2)',
            XXXLO02: '0 0 3em rgba(0, 0, 0, .2)',
            // Inner .6
            XXSI06: 'inset 0 0 .05em rgba(0, 0, 0, .6)',
            XSI06: 'inset 0 0 .1em rgba(0, 0, 0, .6)',
            SI06: 'inset 0 0 .2em rgba(0, 0, 0, .6)',
            MI06: 'inset 0 0 .5em rgba(0, 0, 0, .6)',
            LI06: 'inset 0 0 .7em rgba(0, 0, 0, .6)',
            XLI06: 'inset 0 0 1em rgba(0, 0, 0, .6)',
            XXLI06: 'inset 0 0 1.7em rgba(0, 0, 0, .6)',
            XXXLI06: 'inset 0 0 3em rgba(0, 0, 0, .6)',
            // Inner .4
            XXSI04: 'inset 0 0 .05em rgba(0, 0, 0, .4)',
            XSI04: 'inset 0 0 .1em rgba(0, 0, 0, .4)',
            SI04: 'inset 0 0 .2em rgba(0, 0, 0, .4)',
            MI04: 'inset 0 0 .5em rgba(0, 0, 0, .4)',
            LI04: 'inset 0 0 .7em rgba(0, 0, 0, .4)',
            XLI04: 'inset 0 0 1em rgba(0, 0, 0, .4)',
            XXLI04: 'inset 0 0 1.7em rgba(0, 0, 0, .4)',
            XXXLI04: 'inset 0 0 3em rgba(0, 0, 0, .4)',
            // Inner .2
            XXSI02: 'inset 0 0 .05em rgba(0, 0, 0, .2)',
            XSI02: 'inset 0 0 .1em rgba(0, 0, 0, .2)',
            SI02: 'inset 0 0 .2em rgba(0, 0, 0, .2)',
            MI02: 'inset 0 0 .5em rgba(0, 0, 0, .2)',
            LI02: 'inset 0 0 .7em rgba(0, 0, 0, .2)',
            XLI02: 'inset 0 0 1em rgba(0, 0, 0, .2)',
            XXLI02: 'inset 0 0 1.7em rgba(0, 0, 0, .2)',
            XXXLI02: 'inset 0 0 3em rgba(0, 0, 0, .2)',
            // CONTRAST

            // Outer .6
            XXSO06C: '0 0 .05em rgba(255, 255, 255, .6)',
            XSO06C: '0 0 .1em rgba(255, 255, 255, .6)',
            SO06C: '0 0 .2em rgba(255, 255, 255, .6)',
            MO06C: '0 0 .5em rgba(255, 255, 255, .6)',
            LO06C: '0 0 .7em rgba(255, 255, 255, .6)',
            XLO06C: '0 0 1em rgba(255, 255, 255, .6)',
            XXLO06C: '0 0 1.7em rgba(255, 255, 255, .6)',
            XXXLO06C: '0 0 3em rgba(255, 255, 255, .6)',
            // Outer .4
            XXSO04C: '0 0 .05em rgba(255, 255, 255, .4)',
            XSO04C: '0 0 .1em rgba(255, 255, 255, .4)',
            SO04C: '0 0 .2em rgba(255, 255, 255, .4)',
            MO04C: '0 0 .5em rgba(255, 255, 255, .4)',
            LO04C: '0 0 .7em rgba(255, 255, 255, .4)',
            XLO04C: '0 0 1em rgba(255, 255, 255, .4)',
            XXLO04C: '0 0 1.7em rgba(255, 255, 255, .4)',
            XXXLO04C: '0 0 3em rgba(255, 255, 255, .4)',
            // Outer .2
            XXSO02C: '0 0 .05em rgba(255, 255, 255, .2)',
            XSO02C: '0 0 .1em rgba(255, 255, 255, .2)',
            SO02C: '0 0 .2em rgba(255, 255, 255, .2)',
            MO02C: '0 0 .5em rgba(255, 255, 255, .2)',
            LO02C: '0 0 .7em rgba(255, 255, 255, .2)',
            XLO02C: '0 0 1em rgba(255, 255, 255, .2)',
            XXLO02C: '0 0 1.7em rgba(255, 255, 255, .2)',
            XXXLO02C: '0 0 3em rgba(255, 255, 255, .2)',
            // Inner .6
            XXSI06C: 'inset 0 0 .05em rgba(255, 255, 255, .6)',
            XSI06C: 'inset 0 0 .1em rgba(255, 255, 255, .6)',
            SI06C: 'inset 0 0 .2em rgba(255, 255, 255, .6)',
            MI06C: 'inset 0 0 .5em rgba(255, 255, 255, .6)',
            LI06C: 'inset 0 0 .7em rgba(255, 255, 255, .6)',
            XLI06C: 'inset 0 0 1em rgba(255, 255, 255, .6)',
            XXLI06C: 'inset 0 0 1.7em rgba(255, 255, 255, .6)',
            XXXLI06C: 'inset 0 0 3em rgba(255, 255, 255, .6)',
            // Inner .4
            XXSI04C: 'inset 0 0 .05em rgba(255, 255, 255, .4)',
            XSI04C: 'inset 0 0 .1em rgba(255, 255, 255, .4)',
            SI04C: 'inset 0 0 .2em rgba(255, 255, 255, .4)',
            MI04C: 'inset 0 0 .5em rgba(255, 255, 255, .4)',
            LI04C: 'inset 0 0 .7em rgba(255, 255, 255, .4)',
            XLI04C: 'inset 0 0 1em rgba(255, 255, 255, .4)',
            XXLI04C: 'inset 0 0 1.7em rgba(255, 255, 255, .4)',
            XXXLI04C: 'inset 0 0 3em rgba(255, 255, 255, .4)',
            // Inner .2
            XXSI02C: 'inset 0 0 .05em rgba(255, 255, 255, .2)',
            XSI02C: 'inset 0 0 .1em rgba(255, 255, 255, .2)',
            SI02C: 'inset 0 0 .2em rgba(255, 255, 255, .2)',
            MI02C: 'inset 0 0 .5em rgba(255, 255, 255, .2)',
            LI02C: 'inset 0 0 .7em rgba(255, 255, 255, .2)',
            XLI02C: 'inset 0 0 1em rgba(255, 255, 255, .2)',
            XXLI02C: 'inset 0 0 1.7em rgba(255, 255, 255, .2)',
            XXXLI02C: 'inset 0 0 3em rgba(255, 255, 255, .2)'
        },
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