// Core/components/elements/Modal/Modal.tsx
import React, {MouseEvent, ReactNode, useEffect, useRef, useState} from 'react';
import './Modal.sass';
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {FC, FRBC, FRC} from "WideLayout/Layouts";

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    cls?: string;
    titleCls?: string;
    modalScrollCls?: string;
    bg?: string;
    children: ReactNode;
    zIndex?: number;
    animDuration?: number;
    closeBtn?: boolean; // Added closeBtn prop
    closeOnOutsideClick?: boolean; // New prop
}

const Modal: React.FC<ModalProps> = (
    {
        isOpen,
        onClose,
        title,
        cls,
        titleCls,
        bg,
        modalScrollCls,
        children,
        zIndex = 20,
        closeBtn = false, // Default value set to false
        closeOnOutsideClick = true, // Default to true
        animDuration = 300,
    }) => {
    const [isVisible, setIsVisible] = useState(false);
    const modalWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            if (modalWrapperRef.current) {
                modalWrapperRef.current.style.display = 'flex';
                setTimeout(() => {
                    modalWrapperRef.current!.style.opacity = '1';
                    // Если bg указан, убираем blur и устанавливаем цвет фона
                    if (bg) {
                        modalWrapperRef.current!.style.backdropFilter = 'none';
                        modalWrapperRef.current!.style.backgroundColor = bg;
                    } else {
                        modalWrapperRef.current!.style.backdropFilter = 'blur(15px)';
                        modalWrapperRef.current!.style.backgroundColor = 'transparent';
                    }
                }, 10);
            }
        } else {
            if (modalWrapperRef.current) {
                modalWrapperRef.current.style.opacity = '0';
                // При закрытии возвращаем/сбрасываем стили
                if (bg) {
                    modalWrapperRef.current!.style.backgroundColor = bg;
                    modalWrapperRef.current!.style.backdropFilter = 'none';
                } else {
                    modalWrapperRef.current!.style.backdropFilter = 'blur(0px)';
                    modalWrapperRef.current!.style.backgroundColor = 'transparent';
                }
                setTimeout(() => {
                    if (modalWrapperRef.current) {
                        modalWrapperRef.current.style.display = 'none';
                    }
                    setIsVisible(false);
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        }
    }, [isOpen, bg]);

    const handleClose = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (closeOnOutsideClick && onClose) onClose();
    };

    const handleModalContentClick = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

    if (!isVisible && !isOpen) return null;

    const showCloseBtn = closeBtn || !closeOnOutsideClick;

    return (
        <div
            className={`${isVisible ? 'show' : ''} modal-wrapper fccc`}
            style={{
                zIndex: zIndex ? zIndex : 3,
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                transition: `all ${animDuration}ms ease`,
            }}
            ref={modalWrapperRef}
            onClick={handleClose}
        >
            <FC scroll={'y-auto'} zIndex={zIndex ? zIndex : 4} rounded={3} p={2} pt={'.9rem'}
                cls={`${cls} x-modal`} bg={bg}
                onClick={handleModalContentClick}
                sx={{
                    pointerEvents: 'all',
                    transition: `opacity ${animDuration}ms ease, visibility ${animDuration}ms`
                }}>
                <FRBC g={1}>
                    {title && <FRC cls={`${titleCls} fs-4 mb-1`}>{title}</FRC>}
                    {showCloseBtn && onClose && (
                        <IconButton
                            onClick={onClose}
                            size="small"
                            style={{
                                zIndex: zIndex ? zIndex : 10,
                                pointerEvents: 'all',
                                marginLeft: 'auto',
                                width: 'min-content',
                                aspectRatio: '1 / 1',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                color: '#fff',
                            }}
                        >
                            <CloseRoundedIcon/>
                        </IconButton>
                    )}
                </FRBC>
                <FC h={'100%'} cls={'xmodal-content'}>
                    <div className={`${modalScrollCls} pt-2 overflow-y-scroll no-scrollbar`}>
                        {children}
                    </div>
                </FC>
            </FC>
        </div>
    );
};

export default Modal;
