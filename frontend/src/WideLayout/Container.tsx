// Core/components/elements/Container.tsx

import React, {CSSProperties, forwardRef, ReactNode} from 'react';
import {Box, BoxProps, SxProps, Theme} from '@mui/material';

// @ts-ignore
export interface ContainerProps extends BoxProps {
    children?: ReactNode;
    cls?: string;
    scroll?: 'x-auto' | 'x-scroll' | 'x-hidden' | 'y-auto' | 'y-scroll' | 'y-hidden' | 'auto' | 'scroll' | 'hidden';
    pos?: 'absolute' | 'relative' | 'sticky' | 'static' | 'fixed';
    color?: string;
    bg?: string;
    rounded?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    component?: string;
    pEvents?: boolean;
    w?: BoxProps['width'];
    h?: BoxProps['height'];
    lh?: BoxProps['lineHeight'];
    g?: BoxProps['gap'];
    maxW?: BoxProps['maxWidth'];
    minW?: BoxProps['minWidth'];
    maxH?: BoxProps['maxHeight'];
    minH?: BoxProps['minHeight'];
    cursorPointer?: boolean;
    wrap?: boolean;
}

const Container = forwardRef<any, ContainerProps>((
    {
        children,
        sx = {},
        cls,
        scroll,
        pos,
        color,
        bg,
        rounded,
        pEvents,
        w,
        h,
        lh,
        g,
        maxW,
        minW,
        maxH,
        minH,
        cursorPointer,
        wrap,
        ...props
    }, ref) => {
    // Обработчик стилей прокрутки
    const scrollStyles = (_theme: Theme): SxProps<Theme> => ({
        overflowX: scroll?.startsWith('x-') ? (scroll.split('-')[1] as CSSProperties['overflowX']) : undefined,
        overflowY: scroll?.startsWith('y-') ? (scroll.split('-')[1] as CSSProperties['overflowY']) : undefined,
        overflow: !scroll?.includes('-') ? (scroll as CSSProperties['overflow']) : undefined,
    });

    // Обработчик позиционирования
    const positionStyle = (_theme: Theme): SxProps<Theme> => (pos ? {position: pos as CSSProperties['position']} : {});

    // Обработчик цвета и событий указателя
    const colorStyles = (_theme: Theme): SxProps<Theme> => ({
        color: color,
        backgroundColor: bg,
        pointerEvents: pEvents === undefined
            ? 'unset'
            : !pEvents ? 'none' : 'all',
    });

    // Обработчик радиуса границы
    const borderRadiusStyles = (_theme: Theme): SxProps<Theme> => {
        const borderRadiusMap: Record<number, string> = {
            0: '0rem',
            1: '0.25rem',
            2: '0.375rem',
            3: '0.5rem',
            4: '1rem',
            5: '2rem',
            6: '50%',
        };
        return {
            borderRadius: rounded !== undefined ? borderRadiusMap[rounded] : undefined,
        };
    };

    // Подготавливаем дополнительные пропсы для Box, используя новые сокращенные пропсы
    const additionalBoxProps: Partial<BoxProps> = {
        width: w,
        height: h,
        lineHeight: lh,
        gap: g,
        maxWidth: maxW,
        minWidth: minW,
        maxHeight: maxH,
        minHeight: minH,
    };

    return (
        <Box
            ref={ref}
            {...additionalBoxProps}
            sx={(theme) => {
                const baseSx = typeof sx === 'function' ? sx(theme) : sx;
                return {
                    ...(baseSx as any),
                    ...scrollStyles(theme),
                    ...positionStyle(theme),
                    ...colorStyles(theme),
                    ...borderRadiusStyles(theme),
                    ...(cursorPointer ? {cursor: 'pointer'} : {}),
                    ...(wrap ? {flexWrap: 'wrap'} : {}),
                };
            }}
            className={`${cls ?? ''} ${scroll ? 'no-scrollbar' : ''}`}
            {...props}
        >
            {children}
        </Box>
    );
});

Container.displayName = 'Container';

export default Container;
