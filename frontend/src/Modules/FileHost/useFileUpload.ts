import {useApi} from '../Api/useApi';
import {useState} from 'react';
import {UploadItem} from './UploadProgressWindow';

const useFileUpload = (parentId: number | null) => {
    const {api} = useApi();
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        const item: UploadItem = {name: file.name, progress: 0};
        setUploads(prev => [...prev, item]);
        const formData = new FormData();
        formData.append('files', file);
        if (parentId) formData.append('parent_id', String(parentId));
        await api.post('/api/v1/filehost/files/upload/', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
            onUploadProgress: e => {
                if (e.total !== undefined) {
                    item.progress = Math.round((e.loaded / e.total) * 100);
                    setUploads(u => [...u]);
                }
            }
        });
        setUploads(u => u.filter(i => i !== item));
    };

    return {handleUpload, uploads};
};

export default useFileUpload;
