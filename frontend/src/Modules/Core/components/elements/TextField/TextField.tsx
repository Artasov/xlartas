// Modules/Core/components/elements/TextField/TextField.tsx
import React, {forwardRef} from 'react';
import {TextField as MuiTextField, TextFieldProps as MuiTextFieldProps} from '@mui/material';
import {useTheme} from "Theme/ThemeContext";

interface CustomTextFieldProps extends Omit<MuiTextFieldProps, 'className' | 'disabled'> {
    className?: string;
    baseSx?: any;
    maxHeight?: string;
    borderNone?: boolean;
    disabled?: boolean;
}

const TextField = forwardRef<HTMLDivElement, CustomTextFieldProps>((
    {
        className = '',
        baseSx = {},
        size = 'small',
        borderNone = false,
        disabled = false,
        maxHeight = '40px',
        ...props
    }, ref) => {
    const {plt} = useTheme();
    return (
        <MuiTextField
            {...props}
            inputRef={ref} // Передаем ref к внутреннему input
            size={size}
            disabled={disabled}
            className={`TextField ${borderNone ? 'border-none' : ''} ${className}`}
            sx={{
                '& .MuiInputBase-root': {
                    ...baseSx,
                    color: plt.text.primary70, // Цвет текста внутри поля
                    backgroundColor: 'transparent', // Фон поля
                    borderRadius: '4px', // Закругленные углы
                    maxHeight: maxHeight, // Максимальная высота поля
                    '& fieldset': {
                        borderColor: borderNone
                            ? 'transparent' // Без рамки, если borderNone = true
                            : plt.text.primary25, // Цвет рамки
                    },
                    '&:hover fieldset': {
                        borderColor: plt.text.primary40, // Цвет рамки при наведении
                    },
                    '&.Mui-focused fieldset': {
                        borderWidth: '1px', // Ширина рамки при фокусе
                        borderColor: plt.text.primary55, // Цвет рамки при фокусе
                    },
                    '&.Mui-disabled fieldset': {
                        borderColor: plt.text.primary50, // Цвет рамки при отключенном состоянии
                    },
                },
                '& .MuiInputBase-input': {
                    color: plt.text.primary80, // Цвет текста внутри поля
                    maxHeight: maxHeight,
                    padding: '10px', // Отступы внутри поля
                    '&::placeholder': {
                        color: plt.text.primary60, // Цвет плейсхолдера
                    },
                },
                '& .MuiFormLabel-root': {
                    color: plt.text.primary60, // Цвет лейбла
                    '&.Mui-focused': {
                        color: plt.text.primary70, // Цвет лейбла при фокусе
                    },
                    '&.Mui-disabled': {
                        color: plt.text.primary30, // Цвет лейбла при отключенном состоянии
                    },
                },
                '& .MuiFormHelperText-root': {
                    color: plt.text.primary55, // Цвет вспомогательного текста
                },
            }}
        />
    );
});

TextField.displayName = 'TextField';

export default TextField;
