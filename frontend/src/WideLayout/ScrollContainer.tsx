// core/components/elements/ScrollContainer.tsx
import React, {CSSProperties, forwardRef, useImperativeHandle, useRef} from 'react';
import {IconButton} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {useTheme} from "../Modules/Theme/ThemeContext";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

interface ScrollContainerProps {
    direction?: 'vertical' | 'horizontal';
    overflow?: 'auto' | 'scroll';
    enableArrows?: boolean;
    arrowSize?: number | string;
    arrowWidth?: number;
    slideElCount?: number;
    slideLength?: number;
    children: React.ReactNode;
    className?: string;
    classNameScrollBar?: string;
    gradientOverlaySx?: CSSProperties;
}

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
    (
        {
            direction = 'horizontal',
            overflow = 'auto',
            enableArrows = false,
            arrowWidth = 40,
            arrowSize = 'unset',
            slideElCount,
            slideLength,
            children,
            className = '',
            classNameScrollBar = '',
            gradientOverlaySx
        },
        ref
    ) => {
        const {theme} = useTheme();
        const containerRef = useRef<HTMLDivElement>(null);

        // Expose the containerRef to the parent via forwarded ref
        useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

        const handleScroll = (scrollDirection: 'left' | 'right' | 'up' | 'down') => {
            if (!containerRef.current) return;

            const container = containerRef.current;

            let scrollAmount = 300; // Default scroll amount
            if (slideElCount && container.children.length > 0) {
                const child = container.children[0] as HTMLElement;
                const childSize =
                    direction === 'horizontal' ? child.offsetWidth : child.offsetHeight;
                scrollAmount = childSize * slideElCount;

                // Ensure scroll amount does not exceed container size
                const containerSize =
                    direction === 'horizontal'
                        ? container.offsetWidth
                        : container.offsetHeight;
                if (scrollAmount > containerSize) {
                    const maxElCount = Math.floor(containerSize / childSize);
                    const actualElCount = Math.max(1, maxElCount);
                    scrollAmount = childSize * actualElCount;
                }
            } else if (slideLength) {
                scrollAmount = slideLength;
            }

            if (scrollDirection === 'left' || scrollDirection === 'up') {
                if (direction === 'horizontal') {
                    container.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth',
                    });
                } else {
                    container.scrollBy({
                        top: -scrollAmount,
                        behavior: 'smooth',
                    });
                }
            } else {
                if (direction === 'horizontal') {
                    container.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth',
                    });
                } else {
                    container.scrollBy({
                        top: scrollAmount,
                        behavior: 'smooth',
                    });
                }
            }
        };

        const isHorizontal = direction === 'horizontal';

        // Стиль для контейнера скролла
        const scrollContainerStyle: React.CSSProperties = {
            overflowX: isHorizontal ? overflow : 'hidden',
            overflowY: isHorizontal ? 'hidden' : overflow,
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            scrollBehavior: 'smooth',
            // Уменьшаем ширину при включенных стрелках
            width: enableArrows && isHorizontal ? `calc(100% - ${arrowWidth * 2}px)` : '100%',
            margin: '0 auto',
        };

        // Стиль для градиента
        const gradientStyle: React.CSSProperties = {
            position: 'absolute', top: 0,
            left: enableArrows && isHorizontal ? `${arrowWidth}px` : 0,
            right: enableArrows && isHorizontal ? `${arrowWidth}px` : 0,
            width: enableArrows && isHorizontal ? `calc(100% - ${arrowWidth * 2}px)` : '100%', // Объёмное покрытие, но с отступами
            height: isHorizontal ? '100%' : '100%',
            background: isHorizontal
                ? `linear-gradient(90deg, ${theme.palette.bg.primary.replace(' !important', '')} 0%, rgba(0,0,0,0) 2%,rgba(0,0,0,0) 98%, ${theme.palette.bg.primary.replace(' !important', '')} 100%)`
                : `linear-gradient(0deg, ${theme.palette.bg.primary.replace(' !important', '')} 0%, rgba(0,0,0,0) 2%,rgba(0,0,0,0) 98%, ${theme.palette.bg.primary.replace(' !important', '')} 100%)`,
            pointerEvents: 'none',
            ...gradientOverlaySx,
        };

        return (
            <div className={`position-relative ${className}`}>
                {enableArrows && (
                    <>
                        <IconButton
                            className="position-absolute"
                            style={{
                                top: '50%',
                                left: 0,
                                transform: 'translateY(-50%)',
                                zIndex: 2, // Поверх градиента
                                width: `${arrowWidth}px`,
                                height: `${arrowWidth}px`,
                                minWidth: `${arrowWidth}px`,
                                padding: 0,
                            }}
                            onClick={() => handleScroll(isHorizontal ? 'left' : 'up')}
                        >
                            <ChevronLeftRoundedIcon style={{
                                width: arrowSize,
                                height: arrowSize
                            }} className={'fs-1'}/>
                        </IconButton>
                        <IconButton
                            className="position-absolute"
                            style={{
                                top: '50%',
                                right: 0,
                                transform: 'translateY(-50%)',
                                zIndex: 2, // Поверх градиента
                                width: `${arrowWidth}px`,
                                height: `${arrowWidth}px`,
                                minWidth: `${arrowWidth}px`,
                                padding: 0,
                            }}
                            onClick={() => handleScroll(isHorizontal ? 'right' : 'down')}
                        >
                            <ChevronRightRoundedIcon style={{
                                width: arrowSize,
                                height: arrowSize
                            }} className={'fs-1'}/>
                        </IconButton>
                    </>
                )}
                {/* Единый градиент */}
                <div
                    style={gradientStyle}
                />
                <div
                    className={`${classNameScrollBar} no-scrollbar`}
                    ref={containerRef}
                    style={scrollContainerStyle}
                >
                    {children}
                </div>
            </div>
        );
    }
);

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;
