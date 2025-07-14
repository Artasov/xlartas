// theme/overrides/accordion.ts
import {ThemeOptions} from '@mui/material/styles';

const accordionOverrides: ThemeOptions['components'] = {
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
                minHeight: '48px', // базовая высота
                '&.Mui-expanded': {
                    minHeight: '48px', // остаётся такой же при раскрытии
                },
            },
            /* контейнер с текстом/иконкой внутри хедера */
            content: {
                margin: '12px 0', // базовый вертикальный отступ
                '&.Mui-expanded': {
                    margin: '12px 0', // тот же при раскрытии
                },
            },
        },
    },
};

export default accordionOverrides;
