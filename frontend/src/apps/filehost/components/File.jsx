import React from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import FolderIcon from '@mui/icons-material/FolderOpen';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MovieIcon from '@mui/icons-material/Movie';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import {FaCss3, FaFileCode, FaHtml5, FaJava, FaJs, FaPhp, FaPython} from 'react-icons/fa';
import {useStyles} from "../../core/components/Theme/useStyles";
import Tag from "./Tag";

const File = ({item, onSelect, isSelected, onDoubleClick, onContextMenu, className, type, onTagClick}) => {
    const isFolder = item.hasOwnProperty('subfolders');
    const classes = useStyles();
    const ext = item.name.split('.').pop();

    const handleSelect = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(item);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick(item);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(e, item);
    };

    return type === 'card' ? (
        <div
            className={`h-min file-card ${isSelected ? 'bg-primary bg-opacity-25' : `${classes.bgContrast10}`} 
                        ${className} position-relative rounded-3 p-1 pb-2 fc gap-2`}
            onClick={handleSelect}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            style={{fontSize: '5rem'}}
        >
            <div className={`file-icon ${classes.textPrimary40}`}>
                {isFolder ? <FolderIcon/> : getFileIcon(ext)}
            </div>
            <div className={'px-1 fs-6 file-name text-center '} style={{wordBreak: 'break-all'}}>
                {item.name}
            </div>
            <div className={'frss p-1 flex-wrap gap-1 position-absolute top-0 left-0 h-min w-100'}>
                {item.tags.map(
                    tag => <Tag tag={tag}
                                onClick={() => onTagClick ? onTagClick(tag) : null}
                                deleteBtnVisible={false}/>)}
            </div>
        </div>
    ) : (
        <div key={item.id}
             className={`frsc py-1 px-2 gap-2 rounded-2 bgContrast15 ${isSelected ? 'bg-primary bg-opacity-25' : `${classes.bgContrast10}`}`}
             onDoubleClick={handleDoubleClick}
             onClick={handleSelect}
             onContextMenu={handleContextMenu}>
            {isFolder ? <FolderIcon/> : getFileIcon(ext)}
            <span>{item.name}</span>
            <span>{item.size} KB</span>
            <span>{item.date_created}</span>
            <span>{item.author}</span>
        </div>
    );
};

export default File;

export const getFileIcon = (extension) => {
    const extensionToIcon = {
        'pdf': <PictureAsPdfIcon/>,
        'doc': <DescriptionIcon/>,
        'docx': <DescriptionIcon/>,
        'xls': <DescriptionIcon/>,
        'xlsx': <DescriptionIcon/>,
        'png': <ImageIcon/>,
        'jpg': <ImageIcon/>,
        'jpeg': <ImageIcon/>,
        'gif': <ImageIcon/>,
        'bmp': <ImageIcon/>,
        'tiff': <ImageIcon/>,
        'svg': <ImageIcon/>,
        'mp3': <AudiotrackIcon/>,
        'wav': <AudiotrackIcon/>,
        'ogg': <AudiotrackIcon/>,
        'mp4': <MovieIcon/>,
        'avi': <MovieIcon/>,
        'mov': <MovieIcon/>,
        'wmv': <MovieIcon/>,
        'mkv': <MovieIcon/>,
        'flv': <MovieIcon/>,
        'zip': <ArchiveIcon/>,
        'rar': <ArchiveIcon/>,
        '7z': <ArchiveIcon/>,
        'tar': <ArchiveIcon/>,
        'gz': <ArchiveIcon/>,
        'bz2': <ArchiveIcon/>,
        'txt': <DescriptionIcon/>,
        // 'json': <FaFileAlt/>, // General file icon for JSON
        'xml': <DescriptionIcon/>,
        'csv': <DescriptionIcon/>,
        'md': <DescriptionIcon/>,
        'html': <FaHtml5/>, // Specific icon for HTML
        'css': <FaCss3/>, // Specific icon for CSS
        'js': <FaJs/>, // Specific icon for JavaScript
        'ts': <FaFileCode/>, // Generic code icon for TypeScript
        'py': <FaPython/>, // Specific icon for Python
        'java': <FaJava/>, // Specific icon for Java
        'c': <FaFileCode/>, // Specific icon for C
        'cpp': <FaFileCode/>, // Specific icon for C++
        'cs': <FaFileCode/>, // Specific icon for C#
        'rb': <FaFileCode/>, // Specific icon for Ruby
        'php': <FaPhp/>, // Specific icon for PHP
        // 'conf': <FaFileAlt/>, // Specific icon for configuration files
        // 'yml': <FaFileAlt/>, // Specific icon for YAML files
        // 'yaml': <FaFileAlt/>, // Specific icon for YAML files
        // 'sh': <FaFileAlt/>, // Specific icon for Shell scripts
        // 'bat': <FaFileAlt/>, // Specific icon for Batch scripts
        // 'cmd': <FaFileAlt/>, // Specific icon for Command scripts
        // 'ini': <FaFileAlt/>, // Specific icon for INI files
        // 'log': <FaFileAlt/>, // Specific icon for Log files
        // 'exe': <ImportantDevicesIcon/>,
        // 'iso': <ImportantDevicesIcon/>,
        // add more extensions and their corresponding icons
    };
    return extensionToIcon[extension] || <InsertDriveFileIcon/>;
};

