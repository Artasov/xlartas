import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@mui/material';
import FileTableRow from './FileTableRow';
import FolderTableRow from './FolderTableRow';
import {IFile, IFolder} from './types';
import {setAllFilesCached, setFavoriteFilesCached, setFolderCached} from './storageCache';

interface Props {
    folders: IFolder[];
    files: IFile[];
    selectMode: boolean;
    selected: IFile[];
    showColumns: boolean;
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

const FileTable: React.FC<Props> = ({folders, files, selectMode, selected, showColumns, onToggleSelect, onSelectMode, onDeleteFile, onShareFile, onDownloadFile, onDeleteFolder, onOpenFolder, reload, parentId}) => (
    <Table size="small">
        <TableHead>
            <TableRow>
                <TableCell sx={{p: 0}}/>
                <TableCell sx={{pl: 0}}>name</TableCell>
                {showColumns && <TableCell>upload_date</TableCell>}
                {showColumns && <TableCell>size</TableCell>}
                <TableCell/>
            </TableRow>
        </TableHead>
        <TableBody>
            {folders.map(f => (
                <FolderTableRow
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
                    <FileTableRow key={f.id} file={f}
                                  selectMode={selectMode}
                                  selected={!!selected.find(s => s.id === f.id)}
                                  onToggleSelect={onToggleSelect}
                                  onSelectMode={() => onSelectMode(f)}
                                  onDelete={() => onDeleteFile(f)}
                                  onShare={() => onShareFile(f)}
                                  onDownload={onDownloadFile}
                    />
                ))}
        </TableBody>
    </Table>
);

export default FileTable;
