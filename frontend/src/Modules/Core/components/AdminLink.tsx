// Core/components/AdminLink.tsx
import React from 'react';
import {Link} from 'react-router-dom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {useTheme} from "Theme/ThemeContext";

const AdminLink: React.FC = () => {
    const {theme} = useTheme();

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
            <ManageAccountsIcon
                className={`fs-1 ps-3px`}
                style={{color: theme.palette.text.primary60}}
            />
        </Link>
    );
};

export default AdminLink;
