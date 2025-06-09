// Modules/Core/components/elements/RelativeExtendingButton.tsx

import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {FC, FCCC} from 'wide-containers';

interface RelativeExtendingButtonProps {
    text: string;
    isExpandedInitial?: boolean;
    changeStateBlock?: boolean;
    cls?: string;
    clsMenu?: string;
    clsMenuActive?: string;
    children: ReactNode;
}

const RelativeExtendingButton: React.FC<RelativeExtendingButtonProps> = (
    {
        text,
        isExpandedInitial = false,
        changeStateBlock = false,
        cls,
        clsMenu,
        clsMenuActive,
        children
    }) => {
    const [isExpanded, setIsExpanded] = useState(isExpandedInitial);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Обработчик клика для переключения состояния
    const handleClick = () => {
        if (!changeStateBlock) setIsExpanded(prev => !prev);
    };

    // Обработчик клика вне компонента для закрытия меню
    const handleClickOutside = (event: MouseEvent) => {
        if (!changeStateBlock && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
            setIsExpanded(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <FCCC
            cls={cls}
            ref={buttonRef}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(prev => !prev);
                }
            }}
            style={{cursor: 'pointer'}}
        >
            <span onClick={handleClick} style={{zIndex: 1, position: 'relative'}}>{text}</span>
            <FC
                scroll={'hidden'}
                maxH={isExpanded ? '300px' : '0'}
                cls={`ftrans-300-eio ${clsMenu} ${isExpanded ? clsMenuActive : ''}`}
                aria-hidden={!isExpanded}
            >
                {children}
            </FC>
        </FCCC>
    );
};

export default RelativeExtendingButton;
