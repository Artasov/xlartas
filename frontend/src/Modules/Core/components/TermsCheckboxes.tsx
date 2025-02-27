// Modules/Core/components/TermsCheckboxes.tsx

import React from 'react';
import {FormControlLabel, Typography} from '@mui/material';
import Checkbox from "Core/components/elements/CheckBox"
import {useTheme} from "Theme/ThemeContext";
import {FC} from "WideLayout/Layouts";

interface TermsCheckboxesProps {
    onFirstCheckedChange: (checked: boolean) => void;
    onSecondCheckedChange: (checked: boolean) => void;
    firstChecked: boolean;
    secondChecked: boolean;
    cls?: string;
}

const TermsCheckboxes: React.FC<TermsCheckboxesProps> = (
    {
        onFirstCheckedChange,
        onSecondCheckedChange,
        firstChecked,
        secondChecked,
        cls,
    }) => {
    const {theme} = useTheme();
    const handleFirstChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFirstCheckedChange(event.target.checked);
        onSecondCheckedChange(event.target.checked);
    };

    const handleSecondChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSecondCheckedChange(event.target.checked);
    };

    return (
        <FC g={'3px'} cls={cls}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={firstChecked}
                        onChange={handleFirstChange}
                        // color={'primary'}
                    />}
                label={
                    <Typography variant="body2" sx={{
                        lineHeight: '.85rem',
                        fontSize: '.7rem'
                    }}>
                        Принимаю условия{' '}
                        <a style={{
                            color: `${theme.colors.primary.main}cc`
                        }} href={''} target="_blank" rel="noopener noreferrer">
                            пользовательского соглашения</a>, даю согласие на получение рассылки рекламно-информационных
                        материалов и обработку <a style={{
                        color: `${theme.colors.primary.main}cc`
                    }} href={''} target="_blank" rel="noopener noreferrer">
                        персональных данных
                    </a>.
                    </Typography>
                }
            />
            <FormControlLabel
                control={<Checkbox checked={secondChecked} onChange={handleSecondChange}/>}
                label={
                    <Typography variant="body2" sx={{
                        lineHeight: '.85rem',
                        fontSize: '.7rem'
                    }}>
                        Даю <a style={{
                        color: `${theme.colors.primary.main}cc`
                    }} href={''} target="_blank" rel="noopener noreferrer">
                        согласие
                    </a> на получение SMS-паролей, сервисных сообщений на указанный номер телефона о заказах и новостях
                        автора.
                    </Typography>
                }
            />
        </FC>
    );
};

export default TermsCheckboxes;
