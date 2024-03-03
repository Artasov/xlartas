import React, {useRef, useState} from 'react';
import '../InputBase.css';
import '../form_base.css';
import infoIcon from '../../../../../static/base/images/icons/info.png';
import Tooltip from "../../Tooltip/Tooltip";

const InputText = ({name, label, type, value, onChange, helpText, className}) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef();
    const handleFocus = () => {
        setIsFocused(true);
        inputRef.current.focus()
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <div
            className={`${className} mt-2 form-field ${isFocused ? 'form-field-focus' : ''} ${value ? 'form-field-filled' : ''}`}>
            <label>{label}</label>
            <input
                name={name}
                ref={inputRef}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="input"
            />
            <Tooltip text={helpText}>
                <div className="help-button fccc" onClick={handleFocus}>
                    <img src={infoIcon} className="invert70" alt="Help"/>
                </div>
            </Tooltip>

        </div>
    );
};

export default InputText;
