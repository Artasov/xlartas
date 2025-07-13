import React, {useState} from 'react';
import {Box} from '@mui/material';
import {useTheme} from 'Modules/Theme/ThemeContext';

interface Props {
    file: File | null;
    onChange: (file: File | null) => void;
}

const FileDropZone: React.FC<Props> = ({file, onChange}) => {
    const [over, setOver] = useState(false);
    const {plt} = useTheme();
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
                minHeight: file ? 100 : 200,
                border: '7px dashed',
                backgroundColor: plt.text.primary + '0b',
                borderColor: plt.text.primary + '07',
                borderRadius: 1,
                width: '100%',
                fontSize: '1.3rem',
                fontWeight: '600',
                letterSpacing: '.1rem',
                color: over ? plt.text.primary + '88' : plt.text.primary + '55',
                cursor: 'pointer',
                '&:hover': {
                    borderStyle: 'dashed',
                },
            }}
            onDragOver={e => {
                e.preventDefault();
                setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
        >
            {over ? 'Бросай' : file ? file.name : 'Select file for convert'}
            <input hidden type="file" onChange={e => onChange(e.target.files?.[0] || null)}/>
        </Box>
    );
};

export default FileDropZone;
