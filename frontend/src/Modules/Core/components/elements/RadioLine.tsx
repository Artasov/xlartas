// Modules/Core/components/elements/RadioLine.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";


interface RadioLineProps {
    options: { value: string | number; label: string | number }[];
    selectedValue: string | number | null;
    onChange: (value: string | number) => void;
    minWidth?: number;
    maxWidth?: number;
    itemClass?: string; // Дополнительный класс для стилизации
    className?: string;
}

const RadioLine: React.FC<RadioLineProps> = (
    {
        options,
        className,
        selectedValue,
        onChange,
        minWidth = 20,
        maxWidth = 340,
        itemClass = ''
    }) => {

    const {plt, theme} = useTheme();
    const handleClick = (value: string | number) => {
        onChange(value);
    };

    return (
        <div className={`fr ${className}`}>
            {options.map((option, index) => (
                <div
                    key={option.value}
                    className={`w-min maxw-${maxWidth}px minw-${minWidth}px frcc py-1 px-2
                    transition-all transition-d-300 transition-tf-eio
                    ${index === 0 ? 'rounded-start-3' : ''}
                    ${index === options.length - 1 ? 'rounded-end-3' : ''}
                    ${itemClass}`}
                    style={{
                        color: selectedValue === option.value
                            ? '#fff'
                            : plt.text.primary,
                        backgroundColor: selectedValue === option.value
                            ? theme.colors.secondary.main
                            : plt.text.primary + '22',
                    }}
                    onClick={() => {
                        handleClick(option.value)
                    }}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};

export default RadioLine;
