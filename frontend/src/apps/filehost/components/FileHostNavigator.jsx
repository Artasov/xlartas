import React, {useEffect, useRef, useState} from 'react';
import axiosInstance from '../../core/components/auth/axiosConfig';
import {ErrorProcessing} from '../../core/components/ErrorProcessing';
import {useAuth} from '../../core/components/auth/useAuth';
import {Checkbox, IconButton} from '@mui/material';
import {CloudUpload, CreateNewFolder, Delete, Download, MoveToInbox, PriorityHigh, Share} from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CreateFolderForm from './CreateFolderForm';
import Modal from '../../core/components/elements/Modal/Modal';
import AppsIcon from '@mui/icons-material/Apps';
import TableRowsIcon from '@mui/icons-material/TableRows';
import './FileHostNavigator.css';
import {useStyles} from '../../core/components/Theme/useStyles';
import BackIcon from '@mui/icons-material/ArrowBackIosNew';
import TagsManager from './TagsManager';
import FileView from './FileView';
import ContextMenu from './ContextMenu';

const FileHostNavigator = () => {
    const {user, isAuthenticated, frontendLogout, forceLogin} = useAuth();
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [view, setView] = useState('grid'); // 'grid' or 'list'
    const [selectedItems, setSelectedItems] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showTagsManagerModal, setShowTagsManagerModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [currentTagsObject, setCurrentTagsObject] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [tree, setTree] = useState([]);
    const classes = useStyles();
    const dropZone = useRef(null);

    useEffect(() => {
        const handleBodyDragOver = (event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(true);
        };
        const handleBodyDrop = (event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
        };
        document.body.addEventListener('dragover', handleBodyDragOver);
        document.body.addEventListener('drop', handleBodyDrop);
        return () => {
            document.body.removeEventListener('dragover', handleBodyDragOver);
            document.body.removeEventListener('drop', handleBodyDrop);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated === true) fetchTree();
        else if (isAuthenticated === false) ErrorProcessing.notAuthentication(forceLogin);
    }, [isAuthenticated]);

    useEffect(() => {
        if (tree.length > 0 && !currentFolder) initialNavigateToFolder(tree[0].folder);
    }, [tree]);

    const fetchTree = async () => {
        try {
            const response = await axiosInstance.get('/api/host/tree/');
            const treeData = response.data;
            setTree(treeData);
            console.log('TREE');
            console.log(treeData);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const initialNavigateToFolder = (folder) => {
        setCurrentPath([folder]);
        navigateToFolder(folder);
    };

    const extractItems = (node) => {
        const files = [];
        const folders = [];
        node.files.forEach((file) => file && file.id ? files.push(file) : '');
        node.subfolders.forEach((subfolder) =>
            subfolder.folder && subfolder.folder.id ? folders.push(subfolder.folder) : '');
        setFiles(files);
        setFolders(folders);
    };

    const handleViewChange = (view) => setView(view);

    const handleSelectItem = (item) => {
        setSelectedItems((prev) => {
            const isSelected = prev.includes(item);
            if (isSelected) return prev.filter((i) => i !== item); else return [...prev, item];
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === files.length + folders.length) setSelectedItems([]);
        else setSelectedItems([...files, ...folders]);
    };

    const handleDownload = async () => {
        if (selectedItems.length === 0) return;
        const folders = selectedItems.filter(item => !item.hasOwnProperty('file'));
        const files = selectedItems.filter(item => item.hasOwnProperty('file'));
        try {
            if (folders.length > 0 || files.length > 5) {
                const response = await axiosInstance.post('/api/host/download/archive/', {
                    folder_ids: folders.map(folder => folder.id),
                    file_ids: files.map(file => file.id),
                    archive_format: 'zip' // or 'zip'
                }, {
                    responseType: 'blob'
                });
                const blob = new Blob([response.data], {type: response.headers['content-type']});
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `archive${Math.floor(Math.random() * 9000) + 1000}.rar`); // or 'archive.zip'
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                for (const file of files) {
                    const response = await axiosInstance.post('/api/host/download/file/', {
                        file_id: file.id
                    }, {
                        responseType: 'blob'
                    });
                    const blob = new Blob([response.data], {type: response.headers['content-type']});
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute('download', file.name);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }
            }
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };
    const handleShare = () => {
        // Implement share functionality
    }

    const handleMove = () => {
        // Implement move functionality
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZone.current) dropZone.current.style.zIndex = 2;
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZone.current) dropZone.current.style.zIndex = -1;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        setPreviewFiles((prev) => [...prev, ...files]);
        if (dropZone.current) dropZone.current.style.zIndex = -1;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setPreviewFiles((prev) => [...prev, ...files]);
    };

    const handleBulkDelete = async () => {
        try {
            const file_ids = selectedItems.filter(item => item.hasOwnProperty('file')).map(item => item.id);
            const folder_ids = selectedItems.filter(item => !item.hasOwnProperty('file')).map(item => item.id);
            await axiosInstance.post('/api/host/items/bulk_delete/', {file_ids, folder_ids});
            setFiles(files.filter(file => !file_ids.includes(file.id)));
            setFolders(folders.filter(folder => !folder_ids.includes(folder.id)));
            setSelectedItems([]);
            updateTreeAfterDeletion(file_ids, folder_ids);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleCreateFolder = async (folder) => {
        setShowCreateFolderModal(false);
        const updatedFolders = [...folders, folder];
        setFolders(updatedFolders);
        updateTreeAfterCreation(folder);
        if (currentFolder && currentFolder.id === folder.parent_id) {
            const updatedFolder = {
                ...currentFolder, subfolders: [...currentFolder.subfolders, {folder, files: [], subfolders: []}]
            };
            setCurrentFolder(updatedFolder);
        }
    };

    const updateTreeAfterCreation = (folder) => {
        let newTree = structuredClone(tree); // Используем глубокое клонирование
        const findAndUpdateNode = (node, folder) => {
            if (node.folder.id === folder.parent) {
                if (!node.subfolders) {
                    node.subfolders = [];
                }
                node.subfolders.push({folder, files: [], subfolders: []});
            } else {
                node.subfolders.forEach(subfolder => findAndUpdateNode(subfolder, folder));
            }
        };
        if (newTree.length > 0) findAndUpdateNode(newTree[0], folder);
        setTree(newTree);
    };

    const updateTreeAfterDeletion = (file_ids, folder_ids) => {
        const newTree = [...tree];
        const updateNode = (node) => {
            node.files = node.files.filter(file => !file_ids.includes(file.id));
            node.subfolders = node.subfolders.filter(folder => !folder_ids.includes(folder.folder.id));
            node.subfolders.forEach(updateNode);
        };
        updateNode(newTree[0]);
        setTree(newTree);
    };

    const handleFolderDoubleClick = (folder) => {
        setCurrentPath([...currentPath, folder]);
        navigateToFolder(folder);
    };

    const navigateToFolder = (folder) => {
        const node = findNodeById(folder.id, tree);
        setSelectedItems([]);
        setCurrentFolder(folder);
        extractItems(node);
    };

    const findNodeById = (id, tree) => {
        for (let node of tree) {
            if (node.folder.id === id) return node;
            const subNode = findNodeById(id, node.subfolders);
            if (subNode) return subNode;
        }
        return null;
    };

    const handleFileUpload = async () => {
        const formData = new FormData();
        previewFiles.forEach(file => formData.append('files', file));
        formData.append('parent_id', currentFolder ? currentFolder.id : '');
        try {
            const response = await axiosInstance.post('/api/host/files/upload/', formData);
            const uploadedFiles = response.data;
            updateTreeAfterFileUpload(uploadedFiles);
            setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
            setPreviewFiles([]);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const updateTreeAfterFileUpload = (uploadedFiles) => {
        const newTree = [...tree];
        const findAndUpdateNode = (node) => {
            if (node.folder.id === currentFolder.id) {
                if (!node.files) node.files = [];
                node.files.push(...uploadedFiles);
                console.log('Updated node with new files:', node);
                return true;
            }
            for (const subfolder of node.subfolders) if (findAndUpdateNode(subfolder)) return true;
            return false;
        };
        if (newTree.length > 0) findAndUpdateNode(newTree[0]);
        setTree(newTree);
        console.log('New tree after file upload:', newTree);
    };

    const handleRemovePreviewFile = (index) => {
        setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleContextMenu = (event, item) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2, mouseY: event.clientY - 4, item: item,
        });
        setCurrentTagsObject(item);
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    const handleContextMenuAction = (action) => {
        if (contextMenu) {
            if (action === 'select') handleSelectItem(contextMenu.item);
            else if (action === 'tags') setShowTagsManagerModal(true);
        }
        handleContextMenuClose();
    };

    const handleBack = () => {
        const newPath = currentPath.slice(0, -1);
        setCurrentPath(newPath);
        const newFolder = newPath.length > 0 ? newPath[newPath.length - 1] : tree[0].folder;
        navigateToFolder(newFolder);
    };

    const handleNavigateToFolder = (folder) => {
        const newPath = [];
        let current = folder;
        while (current) {
            newPath.unshift(current);
            current = tree.find(node =>
                ((node.folder.id === current.parent_id) && (node.folder.name !== 'root')))?.folder || null;
        }
        setCurrentPath(newPath);
        navigateToFolder(folder);
    };

    useEffect(() => {
        const handleRightClick = (event) => event.preventDefault();
        document.addEventListener('contextmenu', handleRightClick);
        return () => document.removeEventListener('contextmenu', handleRightClick);
    }, []);

    const handleAddTagToObject = async (tagsObject, tag) => {
        const isFolder = !tagsObject.hasOwnProperty('file');
        const newTree = [...tree];
        const updateTagsInTree = (node) => {
            if (isFolder && node.folder.id === tagsObject.id) {
                node.folder.tags = [...node.folder.tags, tag];
            } else {
                const file = node.files.find(file => file.id === tagsObject.id);
                if (file) {
                    console.log('Find file');
                    console.log(file);
                    file.tags = [...file.tags, tag];
                } else {
                    node.subfolders.forEach(updateTagsInTree);
                }
            }
        };
        updateTagsInTree(newTree[0]);
        setTree(newTree);
    };
    const handleRemoveTagFromObject = async (tagsObject, tag) => {
        const isFolder = !tagsObject.hasOwnProperty('file');
        const newTree = [...tree];
        const updateTagsInTree = (node) => {
            if (isFolder && node.folder.id === tagsObject.id) {
                node.folder.tags = node.folder.tags.filter(t => t.id !== tag.id);
            } else if (!isFolder) {
                const file = node.files.find(file => file.id === tagsObject.id);
                if (file) {
                    file.tags = file.tags.filter(t => t.id !== tag.id);
                } else {
                    node.subfolders.forEach(updateTagsInTree);
                }
            } else {
                node.subfolders.forEach(updateTagsInTree);
            }
        };
        updateTagsInTree(newTree[0]);
        setTree(newTree);
    };

    return (currentFolder ? <div className="file-host-navigator max-vh-without-header fc wide flex-grow-1 pb-3">
        <Modal isOpen={showCreateFolderModal} onClose={() => setShowCreateFolderModal(false)}
               className={`${classes.bgPrimary30} ${classes.boxShadowMO06} mw-350px w-95 fs-3 p-4 pt-3 rounded-4`}>
            <CreateFolderForm parentId={currentFolder.id} onClose={() => setShowCreateFolderModal(false)}
                              onCreate={handleCreateFolder}/>
        </Modal>
        <Modal isOpen={showTagsManagerModal} onClose={() => setShowTagsManagerModal(false)}
               className={`${classes.bgPrimary30} ${classes.boxShadowMO06} mw-350px w-95 fs-3 p-4 pt-3 rounded-4`}>
            <TagsManager tagsObject={currentTagsObject}
                         onAddTagToObject={handleAddTagToObject}
                         onRemoveTagFromObject={handleRemoveTagFromObject}/>
        </Modal>
        <div
            className={`${classes.bgContrast10} view-toggle frc justify-content-sm-between flex-wrap rounded-2 p-2`}>
            <div className="selection-actions frc gap-2">
                <Checkbox
                    icon={<CheckBoxOutlineBlankIcon/>}
                    checkedIcon={<CheckBoxIcon/>}
                    checked={selectedItems.length === files.length + folders.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < files.length + folders.length}
                    onChange={handleSelectAll}
                />
                {selectedItems.length > 0 && (<>
                    <IconButton onClick={handleDownload}>
                        <Download/>
                    </IconButton>
                    <IconButton onClick={handleBulkDelete}>
                        <Delete/>
                    </IconButton>
                    <IconButton onClick={handleShare}>
                        <Share/>
                    </IconButton>
                    <IconButton onClick={handleMove}>
                        <MoveToInbox/>
                    </IconButton>
                    {selectedItems.length === 1 && (<IconButton onClick={() => {
                    }}>
                        <PriorityHigh/>
                    </IconButton>)}
                </>)}
            </div>
            <div className={'frc gap-2'}>
                <IconButton>
                    <input type="file" multiple onChange={handleFileSelect} id="file-input"
                           style={{display: 'none'}}/>
                    <label htmlFor="file-input"><CloudUpload
                        sx={{marginTop: '-2px', marginRight: '3px'}}/></label>
                </IconButton>
                <IconButton onClick={() => setShowCreateFolderModal(true)}>
                    <CreateNewFolder/>
                </IconButton>
                <IconButton onClick={() => handleViewChange('grid')}>
                    <AppsIcon/>
                </IconButton>
                <IconButton onClick={() => handleViewChange('list')}>
                    <TableRowsIcon/>
                </IconButton>
            </div>
        </div>
        <div className="frsc gap-2 p-2">
            <IconButton onClick={handleBack}>
                <BackIcon/>
            </IconButton>
            {currentPath.map(folder => (<React.Fragment key={folder.id}>
                <span>/</span>
                <span onClick={() => handleNavigateToFolder(folder)}>{folder.name}</span>
            </React.Fragment>))}
        </div>
        <FileView
            files={files}
            folders={folders}
            view={view}
            dragging={dragging}
            selectedItems={selectedItems}
            handleSelectItem={handleSelectItem}
            handleFolderDoubleClick={handleFolderDoubleClick}
            handleContextMenu={handleContextMenu}
            handleRemovePreviewFile={handleRemovePreviewFile}
            previewFiles={previewFiles}
            dropZone={dropZone}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleFileUpload={handleFileUpload}
            classes={classes}
        />
        <ContextMenu
            contextMenu={contextMenu}
            handleContextMenuClose={handleContextMenuClose}
            handleContextMenuAction={handleContextMenuAction}
        />
    </div> : '');
};

export default FileHostNavigator;
