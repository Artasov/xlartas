import { ThemeOptions } from '@mui/material/styles';

const darkThemeOptions: ThemeOptions = {
  // @ts-ignore
  colors: {
    primary: {
      dark: '#a81f2e',
      main: '#ff2e46',
      light: '#ff7484',
      lighter: '#fff3f2',
    },
    secondary: {
      dark: '#303189',
      main: '#4e4fdb',
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
    background: { default: '#000000', paper: '#363636' },
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
};

export default darkThemeOptions;
