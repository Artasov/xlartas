// Modules/Core/components/elements/RadioImgLine.tsx
import React from 'react';
import {useTheme} from "Theme/ThemeContext";
import {FR} from "wide-containers";

interface RadioImgLineOption {
    value: string | number;
    imgSrc: string; // путь к картинке/иконке
    alt?: string;   // альтернативный текст для картинки
}

interface RadioImgLineProps {
    options: RadioImgLineOption[];
    selectedValue: string | number | null;
    onChange: (value: string | number) => void;
    minWidth?: number;
    maxWidth?: number;
    itemClass?: string;
    className?: string;
}

const RadioImgLine: React.FC<RadioImgLineProps> = (
    {
        options,
        className,
        selectedValue,
        onChange,
        minWidth = 40,
        maxWidth = 80,
        itemClass = ''
    }) => {
    const {plt, theme} = useTheme();

    const handleClick = (value: string | number) => {
        onChange(value);
    };

    return (
        <FR g={1} cls={className} p-1>
            {options.map((option, index) => {
                const isSelected = selectedValue === option.value;
                return (
                    <div
                        key={option.value}
                        className={`
                            w-min minw-${minWidth}px
                            frcc py-1 px-2 rounded
                            transition-all transition-d-300 transition-tf-eio
                            ${itemClass}
                        `}
                        style={{
                            width: 'min-content',
                            boxShadow: '0 0 15px ' + isSelected
                                ? theme.colors.primary.main
                                : plt.bg.contrast10,
                            cursor: 'pointer',
                        }}
                        onClick={() => handleClick(option.value)}
                    >
                        <img
                            src={option.imgSrc}
                            alt={option.alt ?? String(option.value)}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                    </div>
                );
            })}
        </FR>
    );
};

export default RadioImgLine;
