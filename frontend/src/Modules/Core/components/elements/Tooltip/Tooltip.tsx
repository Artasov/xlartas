// Modules/Core/components/elements/Tooltip/Tooltip.tsx
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import './Tooltip.sass';
import ReactDOM from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({children, text}) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const childrenRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isVisible && childrenRef.current) {
            const childrenRect = childrenRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current!.getBoundingClientRect();
            const newPosition: { [key: string]: string } = {};

            if (childrenRect.top - tooltipRect.height < 0) {
                newPosition.top = `${childrenRect.bottom + 10}px`;
            } else {
                newPosition.bottom = `${window.innerHeight - childrenRect.top + 10}px`;
            }

            if (childrenRect.left + tooltipRect.width > window.innerWidth) {
                newPosition.right = '10px';
            } else {
                newPosition.left = `${childrenRect.left}px`;
            }

            tooltipRef.current!.style.top = newPosition.top || '';
            tooltipRef.current!.style.bottom = newPosition.bottom || '';
            tooltipRef.current!.style.left = newPosition.left || '';
            tooltipRef.current!.style.right = newPosition.right || '';
            showTooltip(true);
        }
    }, [isVisible]);

    const showTooltip = (state: boolean) => {
        if (state) {
            tooltipRef.current!.style.backdropFilter = 'blur(10px)';
            tooltipRef.current!.style.opacity = '100%';
        } else {
            tooltipRef.current!.style.backdropFilter = 'blur(0px)';
            tooltipRef.current!.style.opacity = '0';
        }
    };

    const handleMouseLeave = () => {
        showTooltip(false);
        setTimeout(() => setIsVisible(false), 300);
    };

    const tooltipContent = isVisible && (
        <div className={`tooltip-content ${isVisible ? 'tooltip-content-visible' : ''}`} ref={tooltipRef}>
            <div>{text}</div>
        </div>
    );

    return (
        <>
            <div className="tooltip-container" onMouseEnter={() => setIsVisible(true)} onMouseLeave={handleMouseLeave}
                 ref={childrenRef}>
                {children}
            </div>
            {ReactDOM.createPortal(tooltipContent, document.getElementById('fullscreen-relative')!)}
        </>
    );
};

export default Tooltip;
