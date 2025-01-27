// Core/components/elements/CheckBox.tsx

import React from 'react';
import {Checkbox as MuiCheckbox, CheckboxProps} from '@mui/material';
import {useTheme} from "Theme/ThemeContext";

interface CheckBoxProps extends CheckboxProps {
    color?: 'primary' | 'secondary';
}

const CheckBox: React.FC<CheckBoxProps> = (
    {
        color = 'primary',
        ...props
    }) => {
    const {theme} = useTheme();

    const checkedColor =
        color === 'primary'
            ? theme.colors.primary.main
            : theme.colors.secondary.main;

    return (
        <MuiCheckbox
            {...props}
            sx={{
                '&.Mui-checked': {
                    color: checkedColor,
                },
            }}
        />
    );
};

export default CheckBox;
