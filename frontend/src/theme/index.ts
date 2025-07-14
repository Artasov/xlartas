// theme/index.ts
import {createTheme} from '@mui/material/styles';
import componentOverrides from './componentOverrides';
import darkThemeOptions from './darkTheme';
import lightThemeOptions from './lightTheme';

export const lightTheme = createTheme({
    ...lightThemeOptions,
    components: componentOverrides,
});

export const darkTheme = createTheme({
    ...darkThemeOptions,
    components: componentOverrides,
});

export default darkTheme;
