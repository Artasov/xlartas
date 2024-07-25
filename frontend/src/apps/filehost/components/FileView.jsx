import React from 'react';
import {IconButton, Button} from '@mui/material';
import {Close} from '@mui/icons-material';
import File from './File';

const FileView = ({
    files, folders, view, dragging, selectedItems, handleSelectItem, handleFolderDoubleClick, handleContextMenu,
    handleRemovePreviewFile, previewFiles, dropZone, handleDragEnter, handleDragLeave, handleDragOver, handleDrop,
    handleFileUpload, classes
}) => {
    return (
        <div className={`file-view p-3 flex-grow-1 position-relative rounded-2 fc ${classes.bgContrast10}`}
             style={{transition: 'opacity 400ms ease-in-out'}}>
            <div
                className={`drop-zone w-100 rounded-2 position-absolute left-0 top-0 h-100 
                ${dragging ? `drop-zone-active p-sm-5 p-3 ${classes.bgPrimary15} ${classes.borderPrimary05}`
                    : ''}`}
                style={{borderColor: '#0000', zIndex: dragging ? 2 : -1}}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                ref={dropZone}
            ></div>
            <div
                className="fccc hint_start pointer-events-none justify-content-center align-items-center text-center position-absolute left-0 top-0 h-100 w-100"
                style={{
                    opacity: files.length === 0 && folders.length === 0 && previewFiles.length === 0 ? '100%' : '0%'
                }}>
                <h2 className={`fs-05 fw-7 ${classes.textPrimary20}`}>
                    Drag and drop files for upload here
                </h2>
            </div>
            <div className={`fc h-100 explorer_transition ${dragging ? `opacity-0` : 'opacity-100'}`}>
                {view === 'grid' && !(files.length === 0 && folders.length === 0) ? (
                    <div className="file-grid frs align-content-start flex-grow-1"
                         style={{transition: 'opacity 300ms ease-in-out', opacity: dragging ? '0%' : '100%'}}>
                        {folders.map((folder) => (
                            <File
                                key={folder.id}
                                item={folder}
                                onSelect={() => handleSelectItem(folder)}
                                onDoubleClick={() => handleFolderDoubleClick(folder)}
                                onContextMenu={(e) => handleContextMenu(e, folder)}
                                isSelected={selectedItems.includes(folder)}
                                className="bgContrast15"
                                type="card"
                            />
                        ))}
                        {files.map((file) => (
                            <File
                                key={file.id}
                                item={file}
                                onSelect={() => handleSelectItem(file)}
                                onDoubleClick={() => handleSelectItem(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                isSelected={selectedItems.includes(file)}
                                className="bgContrast15"
                                type="card"
                            />
                        ))}
                    </div>
                ) : !(files.length === 0 && folders.length === 0) ? (
                    <div className="file-list fc gap-1 flex-grow-1"
                         style={{transition: 'opacity 300ms ease-in-out', opacity: dragging ? '0%' : '100%'}}>
                        {folders.map((folder) => (
                            <File
                                key={folder.id}
                                item={folder}
                                onSelect={() => handleSelectItem(folder)}
                                onDoubleClick={() => handleFolderDoubleClick(folder)}
                                onContextMenu={(e) => handleContextMenu(e, folder)}
                                isSelected={selectedItems.includes(folder)}
                                className="bgContrast15"
                                type="row"
                            />
                        ))}
                        {files.map((file) => (
                            <File
                                key={file.id}
                                item={file}
                                onSelect={() => handleSelectItem(file)}
                                onDoubleClick={() => handleSelectItem(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                isSelected={selectedItems.includes(file)}
                                className="bgContrast15"
                                type="row"
                            />
                        ))}
                    </div>
                ) : ''}
                <div className={`files-preview fc gap-3 rounded-2 overflow-hidden 
                    ${previewFiles.length > 0 ? `h-min ${classes.bgContrast05} p-3` : 'h-0'}`}>
                    <div className="file-grid h-100">
                        {previewFiles.map((file, index) => (
                            <File key={index} item={file} onSelect={() => handleRemovePreviewFile(index)}
                                  className="bgContrast15 position-relative" type="card">
                                <IconButton onClick={() => handleRemovePreviewFile(index)}>
                                    <Close/>
                                </IconButton>
                            </File>
                        ))}
                    </div>
                    <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                            onClick={handleFileUpload}>
                        Upload
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FileView;
