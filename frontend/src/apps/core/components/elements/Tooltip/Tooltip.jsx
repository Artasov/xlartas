import React, {useState, useRef, useEffect} from 'react';
import './Tooltip.css';
import ReactDOM from 'react-dom';

const Tooltip = ({children, text}) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef();
    const childrenRef = useRef();

    useEffect(() => {
        if (isVisible && childrenRef.current) {
            const childrenRect = childrenRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const newPosition = {};

            if (childrenRect.top - tooltipRect.height < 0) {
                newPosition.top = childrenRect.bottom + 10;
            } else {
                newPosition.bottom = window.innerHeight - childrenRect.top + 10;
            }

            if (childrenRect.left + tooltipRect.width > window.innerWidth) {
                newPosition.right = 10;
            } else {
                newPosition.left = childrenRect.left;
            }

            tooltipRef.current.style.top = newPosition.top ? `${newPosition.top}px` : '';
            tooltipRef.current.style.bottom = newPosition.bottom ? `${newPosition.bottom}px` : '';
            tooltipRef.current.style.left = newPosition.left ? `${newPosition.left}px` : '';
            tooltipRef.current.style.right = newPosition.right ? `${newPosition.right}px` : '';
            showTooltip(1);
        }
    }, [isVisible]);
    const showTooltip = (state) => {
        if (state) {
            tooltipRef.current.style.backdropFilter = 'blur(10px)';
            tooltipRef.current.style.opacity = '100%';
        } else {
            tooltipRef.current.style.backdropFilter = 'blur(0px)';
            tooltipRef.current.style.opacity = '0';
        }
    }
    const handleMouseLeave = () => {
        showTooltip(0);
        setTimeout(() => setIsVisible(false), 300);
    };
    const tooltipContent = isVisible && (
        <div className={`tooltip-content ${isVisible ? 'tooltip-content-visible' : ''}`} ref={tooltipRef}>
            <div>{text}</div>
        </div>
    );

    return (
        <>
            <div className="tooltip-container" onMouseEnter={() => setIsVisible(true)}
                 onMouseLeave={handleMouseLeave} ref={childrenRef}>
                {children}
            </div>
            {ReactDOM.createPortal(tooltipContent, document.getElementById('fullscreen-relative'))}
        </>
    );
};

export default Tooltip;
