// Modules/Core/components/elements/PhoneField/PhoneField.tsx
import React from 'react';
import PhoneInput from "react-phone-input-2";
import {useTheme} from "Theme/ThemeContext";
import {FC, FR} from "WideLayout/Layouts";
import 'Core/components/elements/PhoneField/PhoneField.sass';

interface PhoneFieldProps {
    phone: string;
    cls?: string;
    onReturn: (e: React.KeyboardEvent) => void;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    showLabel?: boolean;
    error?: string;
}

const PhoneField: React.FC<PhoneFieldProps> = (
    {
        phone,
        onReturn,
        onChange,
        showLabel = true,
        cls,
        disabled = false,
        autoFocus = true,
        error
    }) => {

    const {theme} = useTheme();
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onReturn(e);
        }
    };

    return (
        <FC cls={cls} pos={'relative'}>
            {showLabel && <FR
                pos={'absolute'} top={-9} left={15}
                zIndex={1} fontSize={'.85rem'}
                sx={{lineHeight: '1rem'}} px={'5px'}
                bg={theme.palette.bg.primary}>
                Номер телефона
            </FR>}
            <PhoneInput
                placeholder={'Номер телефона'}
                country={'ru'}
                preferredCountries={['ru', 'by', 'kz', 'ua', 'ge', 'am', 'az', 'kg', 'md']}
                onlyCountries={[
                    'ru', 'by', 'kz', 'ua', 'ge', 'am', 'az', 'kg', 'md',
                    'us', 'br', 'tr', 'de', 'es', 'fr', 'it', 'pt', 'pl',
                    'cz', 'sk', 'lt', 'ee', 'lv', 'gr', 'cy'
                ]}
                inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: autoFocus,
                    onKeyDown: handleKeyDown
                }}
                enableSearch={true}
                disabled={disabled}
                value={phone}
                onChange={onChange}
                autoFormat={true}
                containerClass={`${disabled ? 'opacity-50' : ''} ${error ? 'error' : ''}`}
                dropdownStyle={{
                    color: theme.palette.text.primary80,
                    backgroundColor: theme.palette.bg.primary,
                }}
                searchClass={`p-2`}
                searchStyle={{
                    color: theme.palette.text.primary80,
                    backgroundColor: theme.palette.bg.primary,
                }}
                inputClass={`w-100`}
                inputStyle={{
                    color: theme.palette.text.primary80,
                }}
            />
            {error &&
                <FR fontSize={'.8rem'} mt={'4px'} ml={2} color={theme.colors.error.main}>
                    {error}
                </FR>}
        </FC>

    );
};

export default PhoneField;
