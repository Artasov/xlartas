// Core/components/LogsLink.tsx
import React from 'react';
import {Link} from 'react-router-dom';
import NotesIcon from '@mui/icons-material/Notes';
import {useTheme} from "Theme/ThemeContext";

const LogsLink: React.FC = () => {
    const {theme} = useTheme();

    // Динамически изменяем порт, если текущий — 3000
    const logsUrl = (() => {
        const url = new URL(window.location.href);
        if (url.port === '3000') {
            url.port = '8000';
        }
        url.pathname = '/logui/';
        return url.toString();
    })();

    return (
        <Link to={logsUrl} target="_blank" rel="noopener noreferrer">
            <NotesIcon
                className={`fs-1 ps-3px`}
                style={{color: theme.palette.text.primary60}}
            />
        </Link>
    );
};

export default LogsLink;
