import React from 'react';
import PaginatedList from 'Core/components/elements/PaginatedList';
import {useApi} from '../Api/useApi';
import FileItem from './FileItem';
import {IFile} from './types';

const FavoriteFiles: React.FC = () => {
    const {api} = useApi();

    const load = async (page: number): Promise<IFile[]> => {
        return api.get(`/api/v1/filehost/files/favorite/?page=${page}&page_size=20`);
    };

    return <PaginatedList loadData={load} renderItem={(item) => <FileItem key={item.id} file={item}/>} />;
};

export default FavoriteFiles;
