// Modules/FileHost/useFileUpload.ts
import {useState} from 'react';
import {UploadItem} from './UploadProgressWindow';
import {useFileHostApi} from './useFileHostApi';

const useFileUpload = (parentId: number | null, onUploaded?: () => void) => {
    const {uploadFiles} = useFileHostApi();
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        const item: UploadItem = {name: file.name, progress: 0, done: false};
        setUploads(prev => [...prev, item]);
        const formData = new FormData();
        formData.append('files', file);
        if (parentId) formData.append('parent_id', String(parentId));
        const resp = await uploadFiles(formData, {
            headers: {'Content-Type': 'multipart/form-data'},
            onUploadProgress: e => {
                if (e.total !== undefined) {
                    item.progress = Math.round((e.loaded / e.total) * 100);
                    setUploads(u => [...u]);
                }
            }
        });
        item.progress = 100;
        item.done = true;
        item.file = resp[0];
        setUploads(u => [...u]);
        onUploaded && onUploaded();
    };

    const clearUploads = () => setUploads([]);

    return {handleUpload, uploads, clearUploads};
};

export default useFileUpload;
