import React, {useState} from 'react';
import '../InputCheckBox/InputCheckBox.css';

const InputRadioGroup = ({
                             name,
                             label,
                             defaultValue,
                             helpText,
                             variants,
                             className,
                             classNameGroupContainer,
                             classNameHelpText,
                             classNameRadioButton
                         }) => {
    const [selectedValue, setSelectedValue] = useState(defaultValue);

    const handleOptionClick = (index) => {
        setSelectedValue(index);
    };

    return (
        <div className={`${className} custom-radio-group`}>
            {label && <label className="">{label}</label>}
            {helpText && <small className={classNameHelpText}>{helpText}</small>}
            <input type="hidden" name={name} value={variants[selectedValue]}/>
            <div className={`${classNameGroupContainer} frc custom-radio-options`}>
                {variants.map((variant, index) => (
                    <div key={index}
                         className={`${classNameRadioButton} custom-radio-option frcc gap-2 ${index === selectedValue ? 'custom-checkbox-checked' : ''}`}
                         onClick={() => handleOptionClick(index)}>
                        <div className="custom-checkbox-btn">
                            <div className="custom-checkbox-btn-inner"></div>
                        </div>
                        <span>{variant}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InputRadioGroup;
