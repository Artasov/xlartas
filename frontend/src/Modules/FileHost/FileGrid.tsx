import React from 'react';
import {Box} from '@mui/material';
import FolderCard from './FolderCard';
import FileCard from './FileCard';
import {IFile, IFolder} from './types';
import {setAllFilesCached, setFavoriteFilesCached, setFolderCached} from './storageCache';

interface Props {
    folders: IFolder[];
    files: IFile[];
    selectMode: boolean;
    selected: IFile[];
    onToggleSelect: (f: IFile) => void;
    onSelectMode: (f: IFile) => void;
    onDeleteFile: (f: IFile) => void;
    onShareFile: (f: IFile) => void;
    onDownloadFile: (f: IFile) => void;
    onDeleteFolder: (id: number) => void;
    onOpenFolder: (id: number) => void;
    reload: () => void;
    parentId: number | null;
}

const FileGrid: React.FC<Props> = ({
                                       folders,
                                       files,
                                       selectMode,
                                       selected,
                                       onToggleSelect,
                                       onSelectMode,
                                       onDeleteFile,
                                       onShareFile,
                                       onDownloadFile,
                                       onDeleteFolder,
                                       onOpenFolder,
                                       reload,
                                       parentId
                                   }) => (
    <Box mt={.4} sx={{
        display: 'grid',
        gap: '0.5rem',
        gridTemplateColumns: {
            xs: 'repeat(2,1fr)',
            sm: 'repeat(3,1fr)',
            md: 'repeat(4,1fr)',
            lg: 'repeat(4,1fr)'
        }
    }}>
        {folders.map(f => (
            <FolderCard
                key={f.id}
                id={f.id}
                name={f.name}
                onDelete={onDeleteFolder}
                onOpen={onOpenFolder}
                onRenamed={() => {
                    setFolderCached(parentId, undefined as any);
                    setAllFilesCached(undefined as any);
                    setFavoriteFilesCached(undefined as any);
                    reload();
                }}
            />
        ))}
        {files
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(f => (
                <FileCard key={f.id} file={f} selectMode={selectMode}
                          selected={!!selected.find(s => s.id === f.id)}
                          onToggleSelect={onToggleSelect}
                          onSelectMode={() => onSelectMode(f)}
                          onDelete={() => onDeleteFile(f)}
                          onShare={() => onShareFile(f)}
                          onDownload={onDownloadFile}
                />
            ))}
    </Box>
);

export default FileGrid;
