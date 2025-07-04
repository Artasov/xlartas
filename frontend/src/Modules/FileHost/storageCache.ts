export interface FolderContent {folder: any; folders: any[]; files: any[];}

const cache:{
    folders: Record<string, FolderContent>;
    allFiles?: any[];
    favoriteFiles?: any[];
} = {folders:{}};

export const getFolderCached = (id:number|null)=> cache.folders[id===null?'root':String(id)];
export const setFolderCached = (id:number|null, data:FolderContent)=>{cache.folders[id===null?'root':String(id)] = data;};
export const getAllFilesCached = ()=> cache.allFiles;
export const setAllFilesCached = (data:any[])=>{cache.allFiles=data;};
export const getFavoriteFilesCached = ()=> cache.favoriteFiles;
export const setFavoriteFilesCached = (data:any[])=>{cache.favoriteFiles=data;};
export const clearCache = ()=>{
    cache.folders={};
    cache.allFiles=undefined;
    cache.favoriteFiles=undefined;
};
