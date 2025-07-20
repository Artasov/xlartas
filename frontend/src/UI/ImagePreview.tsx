// UI/ImagePreview.tsx
import React from 'react';
import {Dialog, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    src: string;
    open: boolean;
    onClose: () => void;
}

const ImagePreview: React.FC<Props> = ({src, open, onClose}) => (
    <Dialog open={open} onClose={onClose} maxWidth={'xl'}>
        <IconButton onClick={onClose} sx={{position: 'absolute', top: 8, right: 8}}>
            <CloseIcon/>
        </IconButton>
        <img src={src} alt="preview" style={{maxWidth: '100%', maxHeight: '90vh'}}/>
    </Dialog>
);

export default ImagePreview;
