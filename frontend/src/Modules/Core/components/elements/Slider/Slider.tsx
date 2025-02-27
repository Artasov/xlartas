// Modules/Core/components/elements/Slider/Slider.tsx
import React from 'react';
import {Slider as MuiSlider, SliderProps as MuiSliderProps} from '@mui/material';
import './Slider.sass';
import {useTheme} from "Theme/ThemeContext";

interface SliderProps extends MuiSliderProps {
    className?: string; // возможность добавить дополнительные классы
}

const Slider: React.FC<SliderProps> = ({className = '', ...props}) => {
    const {theme} = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    return (
        <MuiSlider
            {...props}
            className={`custom-slider ${className}`}
            sx={{
                color: theme.palette.primary.bgContrast55, // Цвет основного трека и ползунка
                '& .MuiSlider-thumb': {
                    backgroundColor: isDarkMode ? '#555555' : '#eee', // Цвет ползунка
                    border: `2px solid ${theme.palette.bg.contrast25}`, // Обводка для ползунка
                },
                // '& .MuiSlider-rail': {
                //     backgroundColor: isDarkMode ? '#eee' : '#555555', // Цвет заднего трека
                // },
                '& .MuiSlider-track': {
                    height: '2px',
                    borderColor: isDarkMode ? '#eee' : '#666',
                    backgroundColor: isDarkMode ? '#eee' : '#0000', // Цвет переднего трека
                },
                // '& .MuiSlider-mark': {
                //     backgroundColor: theme.palette.background.default, // Цвет маркеров
                // },
                '& .MuiSlider-markLabel': {
                    fontSize: '0.8em',
                    marginTop: '-4px', // Отступ текста маркеров
                    color: theme.palette.text.primary70, // Цвет текста маркеров
                }
            }}
        />
    );
};

export default Slider;
