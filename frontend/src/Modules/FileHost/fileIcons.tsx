// Modules/FileHost/fileIcons.tsx
import React from 'react';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import ArchiveIcon from '@mui/icons-material/Archive';
import CodeIcon from '@mui/icons-material/Code';
import {SvgIconProps} from '@mui/material';

export const isImage = (name: string): boolean => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
};

export const isVideo = (name: string): boolean => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext);
};

export const getFileIcon = (name: string, props?: SvgIconProps) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (isImage(name)) return <ImageIcon {...props}/>;
    if (isVideo(name)) return <VideoFileOutlinedIcon {...props}/>;
    if (['pdf'].includes(ext)) return <PictureAsPdfIcon {...props}/>;
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return <ArchiveIcon {...props}/>;
    if (['txt', 'md', 'rtf'].includes(ext)) return <ArticleIcon {...props}/>;
    if (['doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) return <DescriptionIcon {...props}/>;
    if (['py', 'js', 'ts', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'html', 'css', 'json'].includes(ext)) return <CodeIcon {...props}/>;
    return <InsertDriveFileOutlinedIcon {...props}/>;
};
