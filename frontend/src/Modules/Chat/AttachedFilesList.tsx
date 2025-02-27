// Modules/Chat/AttachedFilesList.tsx
import React, {useEffect, useState} from 'react';
import {Avatar, Box, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {FRCC} from "WideLayout/Layouts";
import Modal from 'Core/components/elements/Modal/Modal'; // Импортируем ваш компонент Modal

interface AttachedFilesListProps {
    files: File[];
    onRemove: (file: File) => void;
}

const AttachedFilesList: React.FC<AttachedFilesListProps> = ({files, onRemove}) => {
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const newPreviews: { [key: string]: string } = {};

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => ({
                        ...prev,
                        [file.name]: reader.result as string
                    }));
                };
                reader.readAsDataURL(file);
            }
        });

        // Очистка превью при удалении файлов
        return () => {
            setImagePreviews({});
        };
    }, [files]);

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    return (
        <Box display="flex" flexDirection="column" mt={2} width="100%">
            {files.map((file, index) => (
                <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={'4px'}
                    mb={1}
                    bgcolor="background.paper"
                    borderRadius={1}
                    boxShadow={1}
                >
                    {file.type.startsWith('image/') && imagePreviews[file.name] ? (
                        <FRCC style={{cursor: 'pointer'}} onClick={() => handleImageClick(imagePreviews[file.name])}>
                            <Avatar
                                variant="rounded"
                                src={imagePreviews[file.name]}
                                alt={file.name}
                                sx={{width: 36, height: 36, marginRight: 2}}
                            />
                            <span>
                                {file.name}
                            </span>
                        </FRCC>
                    ) : (
                        <span>
                            {file.name}
                        </span>
                    )}
                    <IconButton
                        size="small"
                        onClick={() => onRemove(file)}
                        aria-label={`Удалить ${file.name}`}
                    >
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>
            ))}

            {/* Модальное окно для отображения изображения */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title=""
                closeBtn={true}
                closeOnOutsideClick={true}
            >
                <Box display="flex" justifyContent="center" alignItems="center">
                    <img
                        src={selectedImage ? selectedImage : ''}
                        alt="Preview"
                        style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px'}}
                    />
                </Box>
            </Modal>
        </Box>
    );
};

export default AttachedFilesList;
