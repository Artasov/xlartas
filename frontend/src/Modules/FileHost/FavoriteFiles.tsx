import React from 'react';
import PaginatedList from 'Core/components/elements/PaginatedList';
import {useApi} from '../Api/useApi';
import FileItem from './FileItem';
import {IFile} from './types';
import useFileUpload from './useFileUpload';
import UploadProgressWindow from './UploadProgressWindow';

const FavoriteFiles: React.FC = () => {
    const {api} = useApi();
    const {handleUpload, uploads} = useFileUpload(null);

    const load = async (page: number): Promise<IFile[]> => {
        return api.get(`/api/v1/filehost/files/favorite/?page=${page}&page_size=20`);
    };

    return (
        <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);}}>
            <PaginatedList loadData={load} renderItem={(item) => <FileItem key={item.id} file={item}/>} />
            {uploads.length>0 && <UploadProgressWindow items={uploads}/>}
        </div>
    );
};

export default FavoriteFiles;
