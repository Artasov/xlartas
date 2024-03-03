import React, { useState, useRef, useEffect } from 'react';
import './InputSelect.css';
import upIcon from '../../../../../static/base/images/icons/up-arrow.png';
import Tooltip from "../../Tooltip/Tooltip";
import infoIcon from "../../../../../static/base/images/icons/info.png";

const InputSelect = ({ name, defaultOptionIndex, label, options, helpText, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(options[defaultOptionIndex] || '');
    const dropdownRef = useRef();
    const optionsContainerRef = useRef();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value) => {
        setSelectedValue(value);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`${className} custom-select bg-black-15 ${isOpen ? 'custom-select-opened' : ''}`} ref={dropdownRef}>
            <input type="hidden" name={name} value={selectedValue} />
            {label && <div className="text-wrap p-1">{label}</div>}
            <div className="select-value frcc" onClick={toggleDropdown}>
                <span className="me-3">{selectedValue}</span>
                <img src={upIcon} className="custom-select-arrow invert70" alt="" />
                <Tooltip text={helpText}>
                    <div className="help-button fccc">
                        <img src={infoIcon} className="invert70" alt="Help" />
                    </div>
                </Tooltip>
            </div>
            <div className="options-container no_scrollbar bg-black-15" ref={optionsContainerRef} style={{ height: isOpen ? `${optionsContainerRef.current.scrollHeight}px` : '0px' }}>
                <ul>
                    {options.map((option, index) => (
                        <li key={index} className="option-item" onClick={() => handleOptionClick(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InputSelect;