import React, {ChangeEvent, useEffect, useState} from 'react';
import Button from "Core/components/elements/Button/Button";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    reset?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({onFileSelect, reset}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (reset) {
            setSelectedFile(null);
        }
    }, [reset]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        } else {
            setSelectedFile(null);
            onFileSelect(null);
        }
    };

    return (
        <Button variant="contained" component="label">
            {selectedFile ? selectedFile.name : "Выбрать файл"}
            <input type="file" hidden onChange={handleFileChange}/>
        </Button>
    );
};

export default FileUpload;
