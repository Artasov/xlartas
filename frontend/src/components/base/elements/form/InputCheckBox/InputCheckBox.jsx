import React, {useState, useEffect} from 'react';
import './InputCheckBox.css';

const InputCheckBox = ({name, label, defaultValue, className}) => {
    const [checked, setChecked] = useState(Boolean(defaultValue));

    const toggleChecked = () => {
        setChecked(prevChecked => !prevChecked);
    };

    return (
        <div onClick={toggleChecked}
             className={`${className} custom-checkbox frcc gap-1 ${checked ? 'custom-checkbox-checked' : ''}`}>
            <input type="hidden" name={name} value={+checked}/>
            <div className="custom-checkbox-btn">
                <div className="custom-checkbox-btn-inner"></div>
            </div>
            {label && <div className="text-wrap p-1">{label}</div>}
        </div>
    );
};

export default InputCheckBox;
