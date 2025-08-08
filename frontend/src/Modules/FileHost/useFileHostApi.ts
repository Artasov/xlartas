import {useApi} from 'Api/useApi';

export const useFileHostApi = () => {
    const {api} = useApi();
    return {
        toggleFavorite: (file_id: number) => api.post('/api/v1/filehost/files/toggle_favorite/', {file_id}),
        listAccess: (file_id: number) => api.get(`/api/v1/filehost/access/list/?file_id=${file_id}`),
        grantAccess: (payload: any) => api.post('/api/v1/filehost/access/grant/', payload),
        revokeAccess: (access_id: number) => api.delete('/api/v1/filehost/access/revoke/', {data: {access_id}}),
        getFiles: (page: number, page_size = 20) => api.get(`/api/v1/filehost/files/?page=${page}&page_size=${page_size}`),
        getFavoriteFiles: (page: number, page_size = 20) => api.get(`/api/v1/filehost/files/favorite/?page=${page}&page_size=${page_size}`),
        bulkDelete: (file_ids: number[]) => api.post('/api/v1/filehost/items/bulk_delete/', {file_ids}),
        getStorageUsage: () => api.get('/api/v1/filehost/storage/usage/'),
        addFolder: (name: string, parent_id: number | null) => api.post('/api/v1/filehost/folder/add/', {
            name,
            parent_id
        }),
        deleteItem: (payload: any) => api.delete('/api/v1/filehost/item/delete/', {data: payload}),
        getFile: (id: number) => api.post('/api/v1/filehost/file/', {id}),
        getFolders: () => api.get('/api/v1/filehost/folders/'),
        moveItem: (item_id: number, new_folder_id: number | null) => api.post('/api/v1/filehost/item/move/', {
            item_id,
            new_folder_id
        }),
        renameItem: (item_id: number, new_name: string) => api.post('/api/v1/filehost/item/rename/', {
            item_id,
            new_name
        }),
        getFolder: (id: number) => api.post('/api/v1/filehost/folder/', {id}),
    };
};

export type UseFileHostApi = ReturnType<typeof useFileHostApi>;
