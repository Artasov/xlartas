// Modules/Core/components/AdminLink.tsx
import React from 'react';
import {Link} from 'react-router-dom';
import {useTheme} from "Theme/ThemeContext";
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

const AdminLink: React.FC = () => {
    const {plt} = useTheme();

    const adminUrl = (() => {
        const url = new URL(window.location.href);
        if (url.port === '3000') {
            url.port = '8000';
        }
        url.pathname = '/xladmin/';
        return url.toString();
    })();

    return (
        <Link to={adminUrl} target="_blank" rel="noopener noreferrer">
            <AdminPanelSettingsRoundedIcon
                style={{
                    color: plt.text.primary,
                    fontSize: '2rem',
                }}
            />
        </Link>
    );
};

export default AdminLink;
