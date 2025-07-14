// theme/overrides/tabs.ts
import {ThemeOptions} from '@mui/material/styles';

const tabsOverrides: ThemeOptions['components'] = {
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
};

export default tabsOverrides;
