// Modules/Core/components/elements/AbsoluteExtendingButton.tsx

import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {FC, FCCC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';

interface AbsoluteExtendingButtonProps {
    text: string;
    cls?: string;
    clsMenu?: string;
    clsMenuActive?: string;
    children: ReactNode;
}

const AbsoluteExtendingButton: React.FC<AbsoluteExtendingButtonProps> = (
    {
        text,
        cls,
        clsMenu,
        clsMenuActive,
        children
    }) => {
    const {theme} = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Обработчик клика для переключения состояния
    const handleClick = () => {
        setIsExpanded(prev => !prev);
    };

    // Обработчик клика вне компонента для закрытия меню
    const handleClickOutside = (event: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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
        <FCCC cls={cls} pos={'relative'}
              onClick={handleClick}
              ref={buttonRef}
              role="button"
              aria-expanded={isExpanded}
              aria-haspopup="true"
              tabIndex={0}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsExpanded(prev => !prev);
                  }
              }}
              style={{cursor: 'pointer'}}
        >
            <span style={{zIndex: 1, position: 'relative'}}>{text}</span>
            <FC
                pos={'absolute'}
                top={'100%'}
                left={0}
                right={0}
                scroll={'hidden'}
                maxH={isExpanded ? '200px' : '0'}
                cls={`ftrans-300-eio ${clsMenu} ${isExpanded ? clsMenuActive : ''}`}
                aria-hidden={!isExpanded}
                sx={{
                    backdropFilter: 'blur(15px)'
                }}
            >
                {children}
            </FC>
        </FCCC>
    );
};

export default React.memo(AbsoluteExtendingButton);
