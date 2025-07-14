import {ThemeOptions} from '@mui/material/styles';

const buttonOverrides: ThemeOptions['components'] = {
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
};

export default buttonOverrides;
