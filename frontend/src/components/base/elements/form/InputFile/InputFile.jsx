import React, {useState, useRef} from 'react';
import './InputFile.css';
import closeIcon from '../../../../../static/base/images/icons/close.png';

const InputFile = ({name, maxFileSize, required, label, helpText, className, size}) => {
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState([]); // Добавлено состояние для хранения файлов
    const fileInputRef = useRef();

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (newFiles) => {
        for (let file of newFiles) {
            if (maxFileSize && file.size > maxFileSize) {
                alert(`Размер файла не должен превышать ${maxFileSize / 1000000} МБ.`);
                return;
            }
            setFiles(prevFiles => [...prevFiles, file]);
        }
    };

    const handleFileRemove = (fileName) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={className + ' form-field'}>
            <div
                className={`fccc file-dropzone bg-black-15 ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                style={
                    size === 'small' ? {padding: '0.2rem 0.5rem'} :
                        size === 'medium' ? {padding: '0.5rem'} :
                            size === 'large' ? {padding: '0.7rem'} : {padding: '1rem'}// Предполагаемое значение по умолчанию
                }
            >
                <input
                    name={name}
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{display: 'none'}}
                    required={required}/>
                <span>{label || 'Unknown'}</span>
                {helpText ? <span className={'fs-7 text-white-45'}>Drag and drop or click</span> : ''}
            </div>
            <div className={'uploaded-files-container text-white-70 fs-7 px-1'}>
                {files.map(file => (
                    <div key={file.name} className="uploaded-file frcc">
                        <span className={'uploaded-file-name no_scrollbar'}>{file.name}</span>
                        <span className={'uploaded-file-size'}>{(file.size / 1000000).toFixed(2)} MB</span>
                        <img src={closeIcon} alt="Удалить"
                             width={12} height={12}
                             className={'invert80'}
                             onClick={() => handleFileRemove(file.name)}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InputFile;