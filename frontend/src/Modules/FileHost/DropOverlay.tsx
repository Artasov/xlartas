import React, {useEffect, useState} from 'react';

interface DropOverlayProps { onFileDrop: (file: File | null) => void; }

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
    return <div className="drag-overlay"/>;
};

export default DropOverlay;
