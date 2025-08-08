// Modules/Core/components/AdminLink.tsx
import React, {useMemo} from 'react';
import {useTheme} from "Theme/ThemeContext";
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

const AdminLink: React.FC = () => {
    const {plt} = useTheme();

    const adminUrl = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const url = new URL(window.location.href);
        if (url.port === '3000') {
            url.port = '8000';
        }
        url.pathname = '/xladmin/';
        return url.toString();
    }, []);

    if (!adminUrl) return null;

    return (
        <a href={adminUrl} target="_blank" rel="noopener noreferrer">
            <AdminPanelSettingsRoundedIcon
                style={{
                    color: plt.text.primary,
                    fontSize: '2rem',
                }}
            />
        </a>
    );
};

export default AdminLink;
