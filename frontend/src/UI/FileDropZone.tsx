import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {useTheme} from 'Modules/Theme/ThemeContext';
import {FR} from "wide-containers";
import formatFileSize from "Utils/formatFileSize";

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

    // динамический размер шрифта для имени файла
    const fontSize =
        file
            ? file.name.length < 10
                ? '2.2rem'
                : file.name.length <= 20
                    ? '2rem'
                    : '1.5rem'
            : '1.3rem';

    return (
        <Box
            component="label"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: file ? 100 : 200,
                border: '7px dashed',
                backgroundColor: file ? plt.text.primary : plt.text.primary + '0b',
                borderColor: plt.text.primary + '07',
                transition: 'min-height 520ms ease',
                borderRadius: 1,
                width: '100%',
                fontSize,
                fontWeight: '600',
                letterSpacing: '.1rem',
                color: file ? plt.primary.contrastText : over ? plt.text.primary + '88' : plt.text.primary + '55',
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
            {over ? 'Бросай' : file
                ? <FR>
                    {file.name}
                    {file && (
                        <Typography variant="caption" fontSize={'.9rem'} mt={'auto'} sx={{mb: .2, ml: .5}}>
                            {formatFileSize(file.size)}
                        </Typography>
                    )}
                </FR>
                : 'Select file for convert'
            }
            <input hidden type="file" onChange={e => onChange(e.target.files?.[0] || null)}/>
        </Box>
    );
};

export default FileDropZone;
