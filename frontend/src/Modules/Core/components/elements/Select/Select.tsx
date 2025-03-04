// Modules/Core/components/elements/Select/Select.tsx
import React, {useEffect, useRef, useState} from 'react';
import './Select.sass';
import {useTheme} from "Theme/ThemeContext";

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: Option | null;
    onChange: (option: Option | null) => void;
    placeholder: string;
    menuPlaceholder?: string;
    maxHeight?: number;
    minWidth?: number;
    allowEmpty?: boolean;
    direction?: 'down' | 'up';
    zIndex?: number;
}

const Select: React.FC<SelectProps> = (
    {
        options,
        value,
        onChange,
        placeholder,
        menuPlaceholder = 'Не выбрано',
        maxHeight,
        minWidth = 100,
        allowEmpty = true,
        direction = 'down',
        zIndex = 3
    }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<Option | null>(value);
    const [dropdownHeight, setDropdownHeight] = useState(0);
    const [dynamicMinWidth, setDynamicMinWidth] = useState(minWidth);
    const [isHovered, setIsHovered] = useState(false); // Для отслеживания наведения на select
    const selectRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const hiddenPlaceholderRef = useRef<HTMLSpanElement | null>(null);

    const {theme, plt} = useTheme();

    // Обработчик кликов вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Вычисление высоты выпадающего меню
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const dropdown = dropdownRef.current;
            const rect = dropdown.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate the total height of the rendered options
            const optionWrapper = dropdown.firstElementChild;
            let contentHeight = 0;
            if (optionWrapper && optionWrapper.children.length > 0) {
                for (let i = 0; i < optionWrapper.children.length; i++) {
                    const optionEl = optionWrapper.children[i] as HTMLElement;
                    contentHeight += optionEl.offsetHeight;
                }
            }

            let availableHeight: number;
            if (direction === 'down') {
                availableHeight = viewportHeight - rect.top - 20;
            } else {
                availableHeight = rect.bottom - 20;
            }

            let calculatedHeight = contentHeight;
            if (maxHeight) {
                calculatedHeight = Math.min(calculatedHeight, maxHeight);
            }
            calculatedHeight = Math.min(calculatedHeight, availableHeight);

            setDropdownHeight(calculatedHeight);
        }
    }, [isOpen, direction, maxHeight, selectedValue, options, allowEmpty]);

    // Вычисление минимальной ширины на основе ширины плейсхолдера
    useEffect(() => {
        if (hiddenPlaceholderRef.current) {
            const placeholderWidth = hiddenPlaceholderRef.current.offsetWidth;
            const totalPadding = 20; // 10px слева + 10px справа
            const requiredWidth = placeholderWidth + totalPadding;
            setDynamicMinWidth(Math.max(minWidth, requiredWidth) + 3);
        }
    }, [placeholder, minWidth]);

    // Обработка выбора опции
    const handleSelect = (option: Option | null) => {
        if (option === null) {
            setSelectedValue(null);
            onChange(null);
        } else {
            setSelectedValue(option);
            onChange(option);
        }
        setIsOpen(false);
    };

    // Переключение состояния выпадающего меню
    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    // Обработчики наведения
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const isFloating = selectedValue !== null;

    return (
        <div
            className="custom-select-container"
            ref={selectRef}
            style={{
                position: 'relative',
                minWidth: `${selectedValue
                    ? Math.max(dynamicMinWidth * 0.9, minWidth)
                    : dynamicMinWidth}px`
            }}
        >
            {/* Скрытый элемент для измерения ширины плейсхолдера */}
            <span ref={hiddenPlaceholderRef} className="hidden-placeholder">
                {placeholder}
            </span>
            <div
                className={`custom-select-control px-2 ${isOpen ? 'no-bottom-radius' : ''} ${selectedValue ? 'has-value' : ''}`}
                onClick={toggleDropdown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    backgroundColor: plt.bg.primary,
                    color: plt.text.primary,
                    zIndex: zIndex,
                    borderColor: isOpen
                        ? plt.text.primary55
                        : isHovered // Если курсор наведен, меняем цвет рамки
                            ? plt.text.primary75 // Цвет рамки при наведении
                            : plt.text.primary25,
                    borderRadius: isOpen ? '4px 4px 0 0' : '4px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    transition: 'border-color 0.2s ease' // Плавный переход цвета
                }}
            >
                <span className={`custom-select-placeholder ${isFloating ? 'floating' : ''}`}
                      style={{color: plt.text.primary70}}>
                    {placeholder}
                </span>
                {selectedValue && (
                    <span className="custom-select-value" style={{
                        color: plt.text.primary80,
                    }}>{selectedValue.label}</span>
                )}
            </div>
            <div
                ref={dropdownRef}
                className={`custom-select-dropdown no-scrollbar ${isOpen ? `open` : 'closing'}`}
                style={{
                    backgroundColor: plt.bg.primary,
                    height: isOpen ? `${dropdownHeight}px` : '0',
                    width: '100%',
                    overflowY: 'auto',
                    borderColor: isOpen
                        ? plt.text.primary55
                        : '#0000',
                    borderTopWidth: '0',
                    zIndex: zIndex + 1,
                    borderBottomLeftRadius: isOpen ? '4px' : '0',
                    borderBottomRightRadius: isOpen ? '4px' : '0',
                }}
            >
                <div style={{width: '100%'}}>
                    {allowEmpty && selectedValue && (
                        <div
                            key="empty"
                            onClick={() => handleSelect(null)}
                            className={`custom-select-option`}
                            style={{
                                backgroundColor: plt.bg.primary,
                                color: plt.text.primary
                            }}
                        >
                            {menuPlaceholder}
                        </div>
                    )}
                    {options.map((option) => (
                        <div key={option.value}
                             onClick={() => handleSelect(option)}
                             className={'custom-select-option'}
                             style={{
                                 color: plt.text.primary,
                                 backgroundColor: selectedValue?.value === option.value
                                     //@ts-ignore
                                     ? theme.colors.secondary.light
                                     : plt.bg.primary
                             }}>
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Select;
