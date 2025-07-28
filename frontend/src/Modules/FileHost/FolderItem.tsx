// Modules/FileHost/FolderItem.tsx
import React from 'react';
import {useNavigate} from 'Utils/nextRouter';
import {FRSE} from 'wide-containers';

interface Props {
    id: number;
    name: string;
}

const FolderItem: React.FC<Props> = ({id, name}) => {
    const navigate = useNavigate();
    const open = () => navigate(`/storage/master/${id}/`);
    return (
        <FRSE p={0.5} borderBottom={'1px solid #ccc'} onClick={open} style={{cursor: 'pointer'}}>
            <strong>{name}</strong>
        </FRSE>
    );
};

export default FolderItem;
