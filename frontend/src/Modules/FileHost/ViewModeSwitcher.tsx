// Modules/FileHost/ViewModeSwitcher.tsx
import React from 'react';
import {IconButton} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

interface Props {
    view: 'cards' | 'table';
    onChange: (v: 'cards' | 'table') => void;
}

const ViewModeSwitcher: React.FC<Props> = ({view, onChange}) => (
    <>
        <IconButton onClick={() => onChange('cards')} color={view === 'cards' ? 'primary' : 'default'}>
            <ViewModuleIcon/>
        </IconButton>
        <IconButton onClick={() => onChange('table')} color={view === 'table' ? 'primary' : 'default'}>
            <ViewListIcon/>
        </IconButton>
    </>
);

export default ViewModeSwitcher;
