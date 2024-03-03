import React, {useEffect, useRef, useState} from 'react';
import './modal.css';
import closeIcon from '../../../../static/base/images/icons/close.png';

const Modal = ({isOpen, onClose, className, children}) => {
    const [isVisible, setIsVisible] = useState(false);
    const modalWrapperRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            modalWrapperRef.current.style.display = 'flex';
            setTimeout(() => {
                modalWrapperRef.current.style.opacity = 1;
                modalWrapperRef.current.style.backdropFilter = 'blur(15px)';
            }, 10);
        } else {
            if (modalWrapperRef.current) {
                modalWrapperRef.current.style.opacity = 0;
                modalWrapperRef.current.style.backdropFilter = 'blur(0px)';
                setTimeout(() => {
                    modalWrapperRef.current.style.display = 'none';
                    setIsVisible(false);
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        }
    }, [isOpen]);

    const handleClose = (e) => {
        e.stopPropagation();
        if (onClose) onClose();
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    if (!isVisible && !isOpen) {
        return null;
    }

    return (
        <div ref={modalWrapperRef}
             className={
                 `${isVisible ? 'show' : ''} modal-wrapper 
                position-fixed top-0 left-0 vw-100 vh-100 fccc px-3`
             }
             onClick={handleClose}>
            <div className={`${className} x-modal max-h-800px`} style={{minWidth: 300}}
                 onClick={handleModalContentClick}>
                <div className="modal-content h-100 position-relative fc">
                    <div className={'overflow-y-scroll no-scrollbar'}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
