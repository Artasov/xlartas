import React from 'react';
import {Menu, MenuItem} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface Props {
    anchor: {x: number; y: number} | null;
    onClose: () => void;
    onUpload: (file: File) => void;
    onCreateFolder: () => void;
}

const ContextMenu: React.FC<Props> = ({anchor, onClose, onUpload, onCreateFolder}) => {
    const {t} = useTranslation();
    return (
        <Menu open={!!anchor} onClose={onClose} anchorReference="anchorPosition"
              anchorPosition={anchor ? {top: anchor.y, left: anchor.x} : undefined}>
            <MenuItem>
                <label style={{cursor: 'pointer'}}>
                    {t('upload_file')}
                    <input type="file" hidden onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                            onUpload(e.target.files[0]);
                            onClose();
                        }
                    }}/>
                </label>
            </MenuItem>
            <MenuItem onClick={() => {
                onCreateFolder();
                onClose();
            }}>{t('create_folder')}</MenuItem>
        </Menu>
    );
};

export default ContextMenu;
