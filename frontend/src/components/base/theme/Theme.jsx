import {createTheme} from '@mui/material/styles';

// Создание темной темы
export const darkTheme = createTheme({
    palette: {
        mode: 'dark', // Переключение на темную тему
        // Дополнительная настройка цветов
        primary: {
            main: '#ffffff99',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
    // Здесь вы можете добавить дополнительные настройки, например, изменения в components
});
