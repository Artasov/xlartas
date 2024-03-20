import React, { useState, useRef } from 'react';
import '../InputBase.css';
import '../form_base.css';
import infoIcon from '../../../../../static/base/images/icons/info.png';
import upIcon from '../../../../../static/base/images/icons/up-arrow.png';
import Tooltip from "../../Tooltip/Tooltip";

const InputNumber = ({ name, label, value, onChange, helpText, className, step = 1 }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef();

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => setIsFocused(false);

    const updateValue = (delta) => {
        const newValue = (parseFloat(value) || 0) + delta;
        onChange({ target: { name, value: newValue.toString() } });
    };

    const incrementValue = () => updateValue(step);
    const decrementValue = () => updateValue(-step);

    return (
        <div className={`${className} mt-2 form-field ${isFocused ? 'form-field-focus' : ''} ${value !== '' ? 'form-field-filled' : ''}`}>
            {label && <label>{label}</label>}
            <input
                name={name}
                type="number"
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                ref={inputRef}
                className="input"
                step={step}
            />
            <div className="controls fccc position-absolute top-0 right-10 h-100 gap-1">
                <img width={10} src={upIcon} className="invert70" alt="Increase" onClick={incrementValue} />
                <img width={10} src={upIcon} className="invert70 invertW" alt="Decrease" onClick={decrementValue} />
            </div>
            <Tooltip text={helpText}>
                <div className="help-button fccc right-30">
                    <img src={infoIcon} className="invert70" alt="Help" />
                </div>
            </Tooltip>
        </div>
    );
};

export default InputNumber;
