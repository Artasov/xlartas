import React from 'react';
import {Menu, MenuItem} from '@mui/material';

const ContextMenu = ({contextMenu, handleContextMenuClose, handleContextMenuAction}) => {
    return (
        <Menu keepMounted
              open={contextMenu !== null}
              onClose={handleContextMenuClose}
              anchorReference="anchorPosition"
              anchorPosition={
                  contextMenu !== null
                      ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                      : undefined
              }>
            <MenuItem onClick={() => handleContextMenuAction('select')}>Select</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('download')}>Download</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('delete')}>Delete</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('share')}>Share</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('move')}>Move</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('tags')}>Tags</MenuItem>
            <MenuItem onClick={() => handleContextMenuAction('info')}>Info</MenuItem>
        </Menu>
    );
};

export default ContextMenu;
