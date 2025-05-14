// Modules/xLMine/Xaero/XaeroMapModalButton.tsx
import React, {CSSProperties, useState} from 'react';
import XaeroMapViewer from './XaeroMapViewer';
import Button from "Core/components/elements/Button/Button";

/**
 * Кнопка, открывающая модальное окно с картой на весь экран.
 */
const XaeroMapModalButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // Стили для фона модального оверлея
    const overlayStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };

    // Стили для контейнера модального содержимого
    const modalStyle: CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',    // чтобы не было просветов
        overflow: 'hidden',
    };

    // Стили для кнопки закрытия
    const closeButtonStyle: CSSProperties = {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1001,
        background: 'rgba(0,0,0,0.5)',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: 4,
    };

    return (
        <>
            <Button onClick={openModal} variant="contained"
                    className="fw-bold gap-1 hover-scale-5 ftrans-200-eio" classNameOverride={' '}
                    color={'#fff1'}
                    sx={{
                        fontSize: '1.5rem',
                        backdropFilter: 'blur(5px) saturate(2) brightness(4)',
                    }}>
                Карта мира
            </Button>

            {isOpen && (
                <div style={overlayStyle} onClick={closeModal}>
                    <div
                        style={modalStyle}
                        onClick={e => e.stopPropagation() /* чтобы клик по карте не закрыл */}
                    >
                        <button
                            style={closeButtonStyle}
                            onClick={closeModal}
                            aria-label="Закрыть карту"
                        >
                            ×
                        </button>
                        <XaeroMapViewer
                            width="100%"
                            height="100%"
                            initialScale={0.000001}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default XaeroMapModalButton;
