import React from 'react';
import './ButtonSubmit.css'; // Обновите стили в соответствии с вашими требованиями

const ButtonSubmit = ({text, className, onClick, isLoading}) => {
    return (
        <button
            className={`btn-submit ${className} ${isLoading ? 'loading' : ''}`}
            onClick={onClick}
            disabled={isLoading}
            type="submit">

            {isLoading ? <div className="spinner"></div> : ''}
            <span>{text}</span>
        </button>
    );
};

export default ButtonSubmit;