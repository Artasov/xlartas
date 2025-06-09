// Modules/Chat/MessageInput.tsx

import React, {useState} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {Checkbox, IconButton} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {Message as ToastMessage} from "Core/components/Message";
import {FC, FCCC, FRSC} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";
import AttachedFilesList from './AttachedFilesList'; // Импортируем обновлённый компонент

// Helper function to read a file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read file as data URL.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading file.'));
        };
        reader.readAsDataURL(file);
    });
};

interface MessageInputProps {
    onSend: (message: string, files: any[], isImportant: boolean) => void; // Changed type to include isImportant
    onFileChange: (files: File[]) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({onSend, onFileChange}) => {
    const [newMessage, setNewMessage] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [isImportant, setIsImportant] = useState<boolean>(false); // New state for the checkbox
    const {plt} = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage().then();
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' && files.length === 0) {
            ToastMessage.error('Напишите сообщение или прикрепите файл...');
            return;
        }

        try {
            // Convert files to Base64
            const filesBase64 = await Promise.all(files.map(async (file) => {
                const base64 = await readFileAsDataURL(file);
                const base64Data = base64.split(',')[1];
                if (!base64Data) {
                    throw new Error(`Failed to parse base64 data for file ${file.name}`);
                }
                return {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64Data, // Ensure data is a string
                };
            }));

            onSend(newMessage.trim(), filesBase64, isImportant); // Pass isImportant flag
            setNewMessage('');
            setFiles([]);
            setIsImportant(false); // Reset the checkbox after sending
        } catch (error) {
            console.error('Error sending message:', error);
            ToastMessage.error('Ошибка при отправке сообщения.');
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, ...selectedFiles];
            onFileChange(updatedFiles);
            return updatedFiles;
        });
    };

    const handleRemoveFile = (fileToRemove: File) => {
        setFiles(prevFiles => {
            const updatedFiles = prevFiles.filter(file => file !== fileToRemove);
            onFileChange(updatedFiles);
            return updatedFiles;
        });
    };

    const handleImportantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsImportant(e.target.checked);
    };

    return (
        <FC
            p={1}
            w={'100%'}
            color={plt.text.primary}
        >
            <FRSC>
                <label htmlFor="file-input" style={{cursor: 'pointer'}}>
                    <IconButton component="span">
                        <AttachFileIcon/>
                    </IconButton>
                </label>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    style={{display: 'none'}}
                    onChange={handleFileInputChange}
                />
                <FCCC pos={'relative'} mr={1}>
                    <span style={{
                        color: plt.text.primary,
                        fontSize: '.8rem',
                        position: 'absolute',
                        top: -2,
                        right: 2,
                    }}>важно</span>
                    <Checkbox
                        checked={isImportant}
                        onChange={handleImportantChange}
                        color="primary"
                        style={{transform: 'scale(1.1) translateY(5px)'}}
                    />
                </FCCC>
                <TextareaAutosize
                    minRows={1}
                    maxRows={10}
                    value={newMessage}
                    onChange={handleChange}
                    onKeyUp={handleKeyPress}
                    placeholder="Написать сообщение..."
                    style={{
                        flexGrow: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: `2px solid ${plt.text.primary + '33'}`,
                        color: plt.text.primary + 'dd',
                        resize: 'none',
                        overflow: 'auto',
                        outline: 'none',
                    }}
                />
                <IconButton
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === '' && files.length === 0}
                    style={{opacity: newMessage.trim() === '' && files.length === 0 ? 0.5 : 1}}
                >
                    <SendIcon/>
                </IconButton>
            </FRSC>


            {/* Display the list of attached files */}
            {files.length > 0 && (
                <AttachedFilesList files={files} onRemove={handleRemoveFile}/>
            )}
        </FC>
    );
};

export default MessageInput;
