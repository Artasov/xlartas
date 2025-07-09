import React from 'react';
import {Link} from '@mui/material';
import {FR} from 'wide-containers';
import {IFolder} from './types';
import {useTheme} from "Theme/ThemeContext";

interface Props {
    path: IFolder[];
    onNavigate: (id: number | null) => void;
}

const PathBreadcrumbs: React.FC<Props> = ({path, onNavigate}) => {
    const {plt} = useTheme();
    return (
        <FR g={0.5} px={2} flexWrap={'wrap'} bg={plt.text.primary + '11'} rounded={2} my={.4}>
            <Link underline="hover" onClick={() => onNavigate(null)} style={{cursor: 'pointer'}}>root</Link>
            {path.slice(1).map(p => (
                <React.Fragment key={p.id}>
                    <span>/</span>
                    <Link underline="hover" onClick={() => onNavigate(p.id)} style={{cursor: 'pointer'}}>
                        {p.name}
                    </Link>
                </React.Fragment>
            ))}
            <span>/</span>
        </FR>
    );
};

export default PathBreadcrumbs;
