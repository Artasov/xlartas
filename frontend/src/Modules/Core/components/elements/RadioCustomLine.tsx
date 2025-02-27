// Modules/Core/components/elements/RadioCustomLine.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";
import {FR} from "WideLayout/Layouts";

interface RadioCustomLineOption {
    value: string | number;
    content: React.ReactNode; // Произвольный контент
}

interface RadioCustomLineProps {
    options: RadioCustomLineOption[];
    selectedValue: string | number | null;
    onChange: (value: string | number) => void;
    minWidth?: number;
    maxWidth?: number;
    itemClass?: string;
    className?: string;
}

const RadioCustomLine: React.FC<RadioCustomLineProps> = ({
                                                             options,
                                                             selectedValue,
                                                             onChange,
                                                             minWidth = 40,
                                                             maxWidth = 80,
                                                             itemClass = '',
                                                             className = '',
                                                         }) => {
    const {theme} = useTheme();

    const handleClick = (value: string | number) => {
        onChange(value);
    };

    return (
        <FR cls={className}>
            {options.map((option, index) => {
                const isSelected = selectedValue === option.value;
                return (
                    <div
                        key={option.value}
                        className={` 
              w-min
              maxw-${maxWidth}px
              minw-${minWidth}px
              frcc
              transition-all
              transition-d-300
              transition-tf-eio
            `}
                        style={{
                            cursor: 'pointer'
                        }}
                        onClick={() => handleClick(option.value)}
                    >
                        {/* Здесь выводим переданный контент */}
                        {option.content}
                    </div>
                );
            })}
        </FR>
    );
};

export default RadioCustomLine;
