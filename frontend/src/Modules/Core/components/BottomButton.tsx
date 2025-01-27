// Core/components/BottomButton.tsx
import React, {useEffect, useState} from 'react';
import {useTheme} from 'Theme/ThemeContext';
import useViewportHeight from "Core/hooks/useViewportHeight";
import Button from "Core/components/elements/Button/Button";

interface BottomButtonProps {
    cls?: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    containerRef?: React.RefObject<HTMLDivElement>;
}

const BottomButton: React.FC<BottomButtonProps> = ({cls, onClick, disabled, children, containerRef}) => {
    const {theme} = useTheme();
    const viewportHeight = useViewportHeight();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!containerRef?.current) return;
        const container = containerRef.current;

        const onScroll = () => {
            const {scrollHeight, scrollTop, clientHeight} = container;
            const remainingScroll = scrollHeight - scrollTop - clientHeight;
            // Показывать кнопку, когда пользователь близок к нижней части страницы
            setIsVisible(remainingScroll < 100);
        };

        container.addEventListener('scroll', onScroll);
        // Инициализируем состояние при монтировании
        onScroll();

        return () => {
            container.removeEventListener('scroll', onScroll);
        };
    }, [containerRef, viewportHeight]);

    return (
        <div style={{
            position: 'fixed',
            bottom: 'env(safe-area-inset-bottom)', // Учитывает безопасную область на iOS
            left: 0,
            width: '100%',
            padding: '0 1rem 1rem 1rem',
            zIndex: 1000,
            display: isVisible ? 'flex' : 'none',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        }}
        >
            <Button
                className={cls}
                onClick={onClick}
                variant="contained"
                color="secondary"
                fullWidth
                disabled={disabled}
                sx={{
                    boxShadow: `0 0 20px 10px ${theme.palette.bg.primary}`,
                }}
            >
                {children}
            </Button>
        </div>
    );
};

export default BottomButton;
