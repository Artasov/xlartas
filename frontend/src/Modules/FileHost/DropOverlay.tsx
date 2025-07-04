import React, {useEffect, useState} from 'react';
import {FR} from "wide-containers";

interface DropOverlayProps {
    onFileDrop: (file: File | null) => void;
}

const DropOverlay: React.FC<DropOverlayProps> = ({onFileDrop}) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const handleDrag = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                setActive(true);
            }
        };
        const handleLeave = (e: DragEvent) => {
            if ((e as any).relatedTarget === null) setActive(false);
        };
        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setActive(false);
            if (e.dataTransfer?.files.length) onFileDrop(e.dataTransfer.files[0]);
        };
        window.addEventListener('dragenter', handleDrag);
        window.addEventListener('dragover', handleDrag);
        window.addEventListener('dragleave', handleLeave);
        window.addEventListener('drop', handleDrop);
        return () => {
            window.removeEventListener('dragenter', handleDrag);
            window.removeEventListener('dragover', handleDrag);
            window.removeEventListener('dragleave', handleLeave);
            window.removeEventListener('drop', handleDrop);
        };
    }, [onFileDrop]);

    if (!active) return null;
    return <FR
        pos={'fixed'} sx={{inset: 0}}
        bg={'rgba(0,0,0,0.3)'} pEvents={false} zIndex={2000}
        justC={'center'} alignI={'center'} fontSize={'4rem'} color={'white'}
    >
        Drop!
    </FR>;
};

export default DropOverlay;
