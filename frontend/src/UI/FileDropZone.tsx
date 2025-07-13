import React, {useState} from 'react';
import {Box} from '@mui/material';

interface Props {
    file: File | null;
    onChange: (file: File | null) => void;
    label?: string;
}

const FileDropZone: React.FC<Props> = ({file, onChange, label = 'Select file'}) => {
    const [over, setOver] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onChange(f);
        setOver(false);
    };

    return (
        <Box
            component="label"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100,
                border: over ? '2px dashed' : '1px solid',
                borderColor: 'grey.400',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                    borderStyle: 'dashed',
                },
            }}
            onDragOver={e => {e.preventDefault(); setOver(true);}}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
        >
            {file ? file.name : label}
            <input hidden type="file" onChange={e => onChange(e.target.files?.[0] || null)} />
        </Box>
    );
};

export default FileDropZone;
